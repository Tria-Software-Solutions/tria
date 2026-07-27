---
title: "Building Scalable Microservices with Go: Concurrency, gRPC, and Deployment"
description: "A technical deep dive into designing and implementing production-grade microservices in Go — covering concurrency patterns, gRPC communication, and deployment strategies."
pubDate: "2024-05-24"
author: "tria team"
image: "/assets/img/blog/go-microservices.jpg"
category: "Engineering"
tags: ["Go", "Microservices", "gRPC", "Architecture", "Backend", "Concurrency"]
---

At tria, we've spent years refining our approach to microservice architecture. After delivering dozens of distributed systems across fintech, healthcare, and logistics, we've developed a Go-centric playbook that consistently produces reliable, scalable services. This post covers the patterns and practices we use every day.

---

## Why Go for Microservices?

When we evaluate languages for microservice development, Go consistently rises to the top:

| Factor | Go | Node.js | Java | Rust |
|---|---|---|---|---|
| Startup time | ~5ms | ~100ms | ~2s | ~2ms |
| Binary size | ~12 MB | — | ~200 MB | ~6 MB |
| Memory (idle) | ~8 MB | ~35 MB | ~150 MB | ~3 MB |
| Compile speed | ~2s | — | ~30s | ~3min |
| Concurrency model | Goroutines | Event loop | Threads | Async + Send/Sync |
| Learning curve | Low | Low | Medium | High |

**Go's killer features for microservices:**
- **Fast compilation** — Sub-second rebuilds enable rapid iteration
- **Small binaries** — Ideal for containerized deployments
- **Built-in concurrency** — Goroutines + channels are elegant and powerful
- **Excellent standard library** — `net/http`, `encoding/json`, `database/sql` are production-grade
- **Static typing with simplicity** — Caught-at-compile-time errors without complex generics (pre-1.18) or measured generics (1.18+)

---

## Concurrency Patterns

### Goroutines: The Foundation

Goroutines are lightweight threads managed by the Go runtime. They start with ~2KB of stack space (vs ~1MB for OS threads), enabling millions of concurrent operations.

```go
// Basic goroutine — fire and forget
go func() {
    result := processExpensiveTask()
    log.Printf("Task completed: %v", result)
}()

// With WaitGroup — wait for completion
var wg sync.WaitGroup
for _, item := range items {
    wg.Add(1)
    go func(i Item) {
        defer wg.Done()
        process(i)
    }(item)
}
wg.Wait() // Blocks until all goroutines complete
```

### Pattern 1: Pipeline with Channels

Channels are Go's primitives for goroutine communication. They enable clean pipeline architectures:

```go
func main() {
    // Stage 1: Generate work
    numbers := generate(ctx, 1, 100)

    // Stage 2: Process in parallel (fan-out)
    squared := fanOut(ctx, numbers, 4) // 4 workers

    // Stage 3: Collect results (fan-in)
    for result := range squared {
        fmt.Println(result)
    }
}

func generate(ctx context.Context, start, count int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for i := start; i < start+count; i++ {
            select {
            case out <- i:
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}

func fanOut(ctx context.Context, in <-chan int, workers int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup

    for w := 0; w < workers; w++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for n := range in {
                select {
                case out <- n * n:
                case <-ctx.Done():
                    return
                }
            }
        }()
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}
```

**Key benefits:**
- Backpressure via unbuffered channels (sender blocks until receiver is ready)
- Context-based cancellation propagates through the pipeline
- Worker pool pattern enables controlled parallelism
- Composition: each stage is independently testable

### Pattern 2: Worker Pool (Throttled Concurrency)

For rate-limited operations (API calls, database writes), a bounded worker pool prevents resource exhaustion:

```go
type WorkerPool struct {
    tasks    chan Task
    results  chan Result
    wg       sync.WaitGroup
    ctx      context.Context
    cancel   context.CancelFunc
}

func NewWorkerPool(ctx context.Context, workers int) *WorkerPool {
    ctx, cancel := context.WithCancel(ctx)
    return &WorkerPool{
        tasks:   make(chan Task, 100),
        results: make(chan Result, 100),
        ctx:     ctx,
        cancel:  cancel,
    }
}

func (wp *WorkerPool) Start() {
    for i := 0; i < cap(wp.tasks); i++ {
        wp.wg.Add(1)
        go func(id int) {
            defer wp.wg.Done()
            for {
                select {
                case task, ok := <-wp.tasks:
                    if !ok {
                        return // channel closed
                    }
                    wp.results <- task.Process(wp.ctx)
                case <-wp.ctx.Done():
                    return // context cancelled
                }
            }
        }(i)
    }
}

func (wp *WorkerPool) Submit(task Task) {
    select {
    case wp.tasks <- task:
    case <-wp.ctx.Done():
    }
}

func (wp *WorkerPool) Shutdown() {
    close(wp.tasks)
    wp.wg.Wait()
    close(wp.results)
    wp.cancel()
}
```

### Pattern 3: Circuit Breaker

When a downstream service fails, you want to fail fast — not waste resources on requests that will time out:

```go
type CircuitBreaker struct {
    mu            sync.RWMutex
    state         State
    failures      int
    threshold     int
    resetTimeout  time.Duration
    lastFailure   time.Time
    halfMaxReqs   int
    halfCount     int
}

type State int

const (
    StateClosed   State = iota // Normal operation
    StateOpen                  // Failing — requests rejected immediately
    StateHalfOpen              // Testing if service recovered
)

func (cb *CircuitBreaker) Execute(fn func() error) error {
    if !cb.allowRequest() {
        return ErrCircuitOpen
    }

    err := fn()
    cb.recordResult(err)
    return err
}

func (cb *CircuitBreaker) allowRequest() bool {
    cb.mu.RLock()
    defer cb.mu.RUnlock()

    switch cb.state {
    case StateClosed:
        return true
    case StateOpen:
        if time.Since(cb.lastFailure) > cb.resetTimeout {
            // Transition to half-open
            cb.mu.RUnlock()
            cb.mu.Lock()
            cb.state = StateHalfOpen
            cb.halfCount = 0
            cb.mu.Unlock()
            cb.mu.RLock()
            return true
        }
        return false
    case StateHalfOpen:
        return cb.halfCount < cb.halfMaxReqs
    default:
        return true
    }
}
```

### Pattern 4: Graceful Shutdown

Production services must handle SIGTERM gracefully — drain in-flight requests, close connections, flush buffers:

```go
func main() {
    ctx, stop := signal.NotifyContext(context.Background(),
        syscall.SIGINT, syscall.SIGTERM)
    defer stop()

    srv := &http.Server{Addr: ":8080"}

    // Start server
    go func() {
        if err := srv.ListenAndServe(); err != nil &&
            err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()

    // Wait for shutdown signal
    <-ctx.Done()
    log.Println("Shutting down...")

    // Graceful shutdown with timeout
    shutdownCtx, cancel := context.WithTimeout(
        context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(shutdownCtx); err != nil {
        log.Fatalf("Shutdown error: %v", err)
    }

    // Close database connections, message queues, etc.
    db.Close()
    mq.Close()

    log.Println("Shutdown complete")
}
```

---

## gRPC: Inter-Service Communication

### Why gRPC Over REST?

| Aspect | gRPC | REST |
|---|---|---|
| Protocol | HTTP/2 (binary) | HTTP/1.1 (text) |
| Serialization | Protocol Buffers | JSON / XML |
| Performance | 5-10x faster | Baseline |
| Schema | `.proto` contract | OpenAPI / manual |
| Streaming | Native (server, client, bidirectional) | SSE / WebSocket |
| Code generation | Built-in | OpenAPI generators |
| Browser support | Via gRPC-Web | Native |

### Defining the Contract

```protobuf
// proto/orders/v1/order_service.proto
syntax = "proto3";

package orders.v1;

option go_package = "github.com/tria/orders/v1;orderspb";

service OrderService {
    // Unary — standard request-response
    rpc GetOrder(GetOrderRequest) returns (Order);

    // Server-streaming — client receives a stream of responses
    rpc ListOrders(ListOrdersRequest) returns (stream Order);

    // Client-streaming — client sends a stream of requests
    rpc CreateOrders(stream CreateOrderRequest) returns (CreateOrdersResponse);

    // Bidirectional streaming — both sides send/receive streams
    rpc TrackOrder(stream TrackOrderRequest) returns (stream OrderStatus);
}

message Order {
    string id = 1;
    string user_id = 2;
    repeated LineItem items = 3;
    Money total = 4;
    OrderStatus status = 5;
    google.protobuf.Timestamp created_at = 6;
}

message GetOrderRequest {
    string id = 1;
}

service HealthService {
    rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
}
```

### Server Implementation

```go
// internal/server/order_server.go
type OrderServer struct {
    orderspb.UnimplementedOrderServiceServer
    db     *sql.DB
    cache  *redis.Client
    logger *zap.Logger
}

func (s *OrderServer) GetOrder(
    ctx context.Context,
    req *orderspb.GetOrderRequest,
) (*orderspb.Order, error) {
    // Context-based timeout from gRPC
    deadline, ok := ctx.Deadline()
    if ok {
        s.logger.Debug("request deadline", zap.Time("deadline", deadline))
    }

    // Check cache first
    if cached, err := s.getCached(ctx, req.Id); err == nil {
        return cached, nil
    }

    // Query database
    order, err := s.db.GetOrder(ctx, req.Id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, status.Error(codes.NotFound, "order not found")
        }
        return nil, status.Error(codes.Internal, "database error")
    }

    // Cache for next request
    go s.setCache(context.Background(), req.Id, order)

    return order.ToProto(), nil
}

func (s *OrderServer) ListOrders(
    req *orderspb.ListOrdersRequest,
    stream orderspb.OrderService_ListOrdersServer,
) error {
    // Paginated streaming — send in batches
    page := &orderspb.PageRequest{
        PageSize: 50,
        PageToken: req.PageToken,
    }

    for {
        orders, nextToken, err := s.db.ListOrders(stream.Context(), page)
        if err != nil {
            return status.Error(codes.Internal, err.Error())
        }

        for _, order := range orders {
            if err := stream.Send(order.ToProto()); err != nil {
                return err
            }
        }

        if nextToken == "" {
            break // no more pages
        }
        page.PageToken = nextToken
    }

    return nil
}
```

### Client Implementation with Retries

```go
// internal/client/order_client.go
type OrderClient struct {
    conn   *grpc.ClientConn
    client orderspb.OrderServiceClient
    cb     *CircuitBreaker
}

func NewOrderClient(target string) (*OrderClient, error) {
    // Retry + timeout interceptors
    conn, err := grpc.Dial(
        target,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithUnaryInterceptor(grpc_retry.UnaryClientInterceptor(
            grpc_retry.WithMax(3),
            grpc_retry.WithBackoff(grpc_retry.BackoffExponential(100*time.Millisecond)),
            grpc_retry.WithCodes(codes.Unavailable, codes.DeadlineExceeded),
        )),
        grpc.WithUnaryInterceptor(grpc_middleware.ChainUnaryClient(
            grpc_ctxtags.UnaryClientInterceptor(),
            grpc_opentracing.UnaryClientInterceptor(),
        )),
    )
    if err != nil {
        return nil, fmt.Errorf("grpc dial: %w", err)
    }

    return &OrderClient{
        conn:   conn,
        client: orderspb.NewOrderServiceClient(conn),
        cb:     &CircuitBreaker{threshold: 5, resetTimeout: 30 * time.Second},
    }, nil
}

func (c *OrderClient) GetOrder(ctx context.Context, id string) (*orderspb.Order, error) {
    var order *orderspb.Order

    err := c.cb.Execute(func() error {
        var err error
        order, err = c.client.GetOrder(ctx, &orderspb.GetOrderRequest{Id: id})
        return err
    })

    if err == ErrCircuitOpen {
        return c.getOrderFallback(ctx, id) // serve stale cache
    }

    return order, err
}
```

### Interceptor Patterns

```go
// Unary server interceptor — logging + recovery
func LoggingInterceptor(logger *zap.Logger) grpc.UnaryServerInterceptor {
    return func(
        ctx context.Context,
        req interface{},
        info *grpc.UnaryServerInfo,
        handler grpc.UnaryHandler,
    ) (interface{}, error) {
        start := time.Now()

        // Panic recovery
        defer func() {
            if r := recover(); r != nil {
                logger.Error("panic recovered",
                    zap.String("method", info.FullMethod),
                    zap.Any("panic", r),
                    zap.Stack("stack"),
                )
            }
        }()

        resp, err := handler(ctx, req)

        logger.Info("gRPC call",
            zap.String("method", info.FullMethod),
            zap.Duration("latency", time.Since(start)),
            zap.Error(err),
        )

        return resp, err
    }
}

// Validation interceptor
func ValidationInterceptor() grpc.UnaryServerInterceptor {
    return func(
        ctx context.Context,
        req interface{},
        info *grpc.UnaryServerInfo,
        handler grpc.UnaryHandler,
    ) (interface{}, error) {
        if v, ok := req.(interface{ Validate() error }); ok {
            if err := v.Validate(); err != nil {
                return nil, status.Error(codes.InvalidArgument, err.Error())
            }
        }
        return handler(ctx, req)
    }
}
```

---

## Deployment Strategy

### Service Template (Standardized)

Every microservice at tria follows this structure:

```
service/
├── cmd/
│   └── server/
│       └── main.go              # Entry point, DI wiring
├── internal/
│   ├── config/
│   │   └── config.go            # Configuration (env-based)
│   ├── server/
│   │   └── grpc.go              # gRPC server setup + interceptors
│   ├── repository/
│   │   ├── postgres.go          # Database access
│   │   └── cache.go             # Redis cache
│   ├── service/
│   │   └── orders.go            # Business logic
│   └── middleware/
│       ├── logging.go           # Structured logging
│       ├── metrics.go           # Prometheus metrics
│       └── tracing.go           # OpenTelemetry tracing
├── proto/
│   └── orders/
│       └── v1/
│           └── order.proto      # Protobuf contract
├── Dockerfile                   # Multi-stage build
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml                 # Horizontal Pod Autoscaler
├── Makefile                     # Build, test, lint targets
├── go.mod / go.sum
└── README.md
```

### Multi-Stage Docker Build

```dockerfile
# Stage 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux \
    go build -ldflags="-s -w" -o /app ./cmd/server

# Stage 2: Runtime
FROM gcr.io/distroless/base-debian12:nonroot
COPY --from=builder /app /app
EXPOSE 8080
ENTRYPOINT ["/app"]
```

**Size:** ~12 MB compressed. **Startup:** ~50ms.

### Kubernetes Manifest

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxUnavailable: 0       # Zero-downtime deploys
      maxSurge: 1
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      terminationGracePeriodSeconds: 45 # Must exceed service shutdown timeout
      containers:
        - name: order-service
          image: tria/order-service:latest
          ports:
            - containerPort: 8080  # gRPC
            - containerPort: 9090  # Prometheus metrics
          env:
            - name: DB_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            grpc:
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            grpc:
              port: 8080
            initialDelaySeconds: 3
            periodSeconds: 5
---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Health Check + Readiness

Every service must expose gRPC health checks:

```go
import "google.golang.org/grpc/health/grpc_health_v1"

func (s *OrderServer) Check(
    ctx context.Context,
    req *grpc_health_v1.HealthCheckRequest,
) (*grpc_health_v1.HealthCheckResponse, error) {
    // Verify database connectivity
    if err := s.db.Ping(ctx); err != nil {
        return &grpc_health_v1.HealthCheckResponse{
            Status: grpc_health_v1.HealthCheckResponse_NOT_SERVING,
        }, nil
    }

    // Verify cache connectivity
    if err := s.cache.Ping(ctx); err != nil {
        return &grpc_health_v1.HealthCheckResponse{
            Status: grpc_health_v1.HealthCheckResponse_NOT_SERVING,
        }, nil
    }

    return &grpc_health_v1.HealthCheckResponse{
        Status: grpc_health_v1.HealthCheckResponse_SERVING,
    }, nil
}
```

---

## Observability

### Structured Logging (zap)

```go
logger, _ := zap.NewProduction()
defer logger.Sync()

// Structured fields — not printf!
logger.Info("order processed",
    zap.String("order_id", order.ID),
    zap.Duration("processing_time", duration),
    zap.Int("item_count", len(order.Items)),
)
```

### Metrics (Prometheus)

```go
var (
    requestDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
        Name:    "order_service_request_duration_seconds",
        Help:    "Request latency in seconds",
        Buckets: prometheus.DefBuckets,
    }, []string{"method", "status"})

    requestTotal = promauto.NewCounterVec(prometheus.CounterOpts{
        Name: "order_service_requests_total",
        Help: "Total number of requests",
    }, []string{"method", "status"})

    activeRequests = promauto.NewGauge(prometheus.GaugeOpts{
        Name: "order_service_active_requests",
        Help: "Current number of in-flight requests",
    })
)

// Use in interceptor
func MetricsInterceptor() grpc.UnaryServerInterceptor {
    return func(
        ctx context.Context,
        req interface{},
        info *grpc.UnaryServerInfo,
        handler grpc.UnaryHandler,
    ) (interface{}, error) {
        start := time.Now()
        activeRequests.Inc()
        defer activeRequests.Dec()

        resp, err := handler(ctx, req)

        status := "ok"
        if err != nil {
            status = "error"
        }

        requestDuration.WithLabelValues(info.FullMethod, status).Observe(
            time.Since(start).Seconds())
        requestTotal.WithLabelValues(info.FullMethod, status).Inc()

        return resp, err
    }
}
```

### Distributed Tracing (OpenTelemetry)

```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace"
    "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer() (*trace.TracerProvider, error) {
    exporter, err := otlptrace.New(
        context.Background(),
        otlptracehttp.NewClient(
            otlptracehttp.WithEndpoint("otel-collector:4318"),
            otlptracehttp.WithInsecure(),
        ),
    )
    if err != nil {
        return nil, err
    }

    tp := trace.NewTracerProvider(
        trace.WithBatcher(exporter),
        trace.WithSampler(trace.AlwaysSample()),
    )

    otel.SetTracerProvider(tp)
    return tp, nil
}
```

---

## Lessons Learned

After years of building Go microservices in production, these are our most hard-won lessons:

### Do

- **Start monolith, extract wisely** — Premature microservices add complexity without benefit
- **Use gRPC for internal communication** — The performance and contract benefits are real
- **Standardize on templates** — Every service should look the same (project structure, logging, metrics, deployment)
- **Invest in observability from day one** — You can't debug what you can't see
- **Implement circuit breakers and retries** — Networks are unreliable by design
- **Use graceful shutdown** — Every service must handle SIGTERM properly

### Don't

- **Share databases between services** — Each service owns its data (database-per-service pattern)
- **Use synchronous calls for long chains** — Event-driven patterns (queues, events) scale better
- **Ignore startup ordering** — Your service should retry connecting to dependencies, not crash on startup
- **Skip load testing** — What works with 100 req/s breaks at 10,000 req/s
- **Forget about configuration** — Environment variables > config files > hardcoded values

### The Result

When done right, a Go microservice architecture delivers:

- **99.9%+ uptime** — Through self-healing deployments and circuit breakers
- **Sub-10ms p99 latency** — For most request-response patterns
- **50+ deploys per day** — Across the organization, with zero-downtime
- **10x resource efficiency** — vs equivalent Java or Node.js services

Go microservices, when built with the patterns above, are a joy to operate. The language stays out of your way, the tooling is excellent, and the resulting systems are reliable, observable, and easy to evolve.
