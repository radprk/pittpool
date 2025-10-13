# PittPool Load Testing with Artillery

## Overview
This directory contains load testing scenarios for the PittPool application using Artillery.

## Test Scenarios

### 1. Driver Journey
- Register as a driver
- Post a ride
- View posted rides

### 2. Rider Journey
- Register as a rider
- Create a ride request
- Browse available rides
- Book a ride

### 3. Browse Rides
- Anonymous users browsing available rides

### 4. User Profile Update
- Register as user (both driver and rider)
- View profile
- Update vehicle information

## Running Tests

### Basic Load Test
```bash
artillery run tests/load-test.yml
```

### Quick Test (10 users)
```bash
artillery quick --count 10 --num 5 http://localhost:5000/api/rides
```

### Generate HTML Report
```bash
artillery run --output report.json tests/load-test.yml
artillery report report.json
```

### Run Specific Scenario
Create a custom test file or modify the weights in `load-test.yml`

## Test Phases

1. **Warm up** (60s): 5 users/second
2. **Ramp up** (120s): 10 users/second  
3. **Peak load** (60s): 20 users/second

## Metrics to Watch

- **Response times**: Should be under 500ms for most requests
- **Success rate**: Should be above 95%
- **Throughput**: Requests per second
- **Error rate**: Should be minimal

## Prerequisites

Make sure:
1. Backend is running on `http://localhost:5000`
2. Database is running and accessible
3. All services are healthy

## Customization

Edit `load-test.yml` to:
- Change user arrival rates
- Adjust test duration
- Modify scenario weights
- Add new test scenarios

## Installation

```bash
npm install -g artillery
```

## Advanced Usage

### Test with Socket.io (Messaging)
```bash
artillery run tests/messaging-load-test.yml
```

### Monitor Real-time
```bash
artillery run --output results.json tests/load-test.yml
```

Then in another terminal:
```bash
artillery report --output report.html results.json
```

