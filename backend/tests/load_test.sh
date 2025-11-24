#!/bin/bash

ENDPOINT="http://localhost:8000/api/v1/waitlist/subscribe"

echo "Waitlist API Load Test - Testing Rate Limiting"
echo "================================================="
echo "Sending requests as fast as possible to trigger rate limit"
echo ""

success_count=0
conflict_count=0
rate_limit_count=0
error_count=0

for i in {1..30}; do
  email="test${i}@gmail.com"

  response=$(curl -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"email":"'"$email"'","source":"waitlist"}' \
    -s -w "\n%{http_code}")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  timestamp=$(date +%H:%M:%S)

  case $http_code in
  201)
    success_count=$((success_count + 1))
    echo "[$timestamp] ✓ 201 Created - $email"
    ;;
  409)
    conflict_count=$((conflict_count + 1))
    echo "[$timestamp] ⚠ 409 Conflict - $email (duplicate)"
    ;;
  429)
    rate_limit_count=$((rate_limit_count + 1))
    echo "[$timestamp] ⏱ 429 Rate Limited - $email"
    ;;
  422)
    error_count=$((error_count + 1))
    echo "[$timestamp] ✗ 422 Validation Error - $email"
    echo "    Response: $body"
    ;;
  *)
    error_count=$((error_count + 1))
    echo "[$timestamp] ✗ $http_code Error - $email"
    echo "    Response: $body"
    ;;
  esac

  # No sleep - send requests fast to test rate limiting
done

echo ""
echo "================================================="
echo "Summary:"
echo "  Created:      $success_count"
echo "  Conflicts:    $conflict_count"
echo "  Rate Limited: $rate_limit_count"
echo "  Errors:       $error_count"
echo "================================================="
