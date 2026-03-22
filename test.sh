#!/bin/bash

# NOTE: Ensure the 'jq' tool is installed (sudo apt install jq) to parse JSON responses.
TARGET_URL="https://webhook.site/1122ccb5-12a9-4d2a-acf9-e0e25013e7fd"
API_URL="http://localhost:5000/api"

echo "🚀 Starting Master Integration Test for all 7 Pipeline Types..."

# Helper function to Create Pipeline, Link Subscriber, and Ingest Data
run_full_test() {
    local name=$1
    local type=$2
    local payload=$3
    
    echo "--- Testing: $name ($type) ---"
    
    # 1. Create Pipeline
    local resp=$(curl -s -X POST "$API_URL/pipelines" \
         -H "Content-Type: application/json" \
         -d "{\"name\": \"$name\", \"processingType\": \"$type\"}")
    local id=$(echo $resp | jq -r '.id')
    
    # 2. Add Subscriber (Linking the target URL to the pipeline)
    curl -s -X POST "$API_URL/pipelines/$id/subscribers" \
         -H "Content-Type: application/json" \
         -d "{\"targetUrl\": \"$TARGET_URL\"}" > /dev/null
    
    # 3. Ingest Data (Producer sends data to the queue)
    curl -s -X POST "$API_URL/ingest/$id" \
         -H "Content-Type: application/json" \
         -d "$payload"
    
    echo -e "✅ Done for $type (ID: $id)\n"
}

# --- Execute Tests for all Processing Actions ---

# 1. Uppercase Action
run_full_test "Upper Case Pipeline" "uppercase" '{"text": "hello world", "status": "active"}'

# 2. Lowercase Action
run_full_test "Lower Case Pipeline" "lowercase" '{"TITLE": "SHOUTING TEXT", "CODE": "ABC-123"}'

# 3. Add Timestamp Action
run_full_test "Timestamp Pipeline" "add_timestamp" '{"event": "user_login", "username": "jalila_m"}'

# 4. PII Masking (Emails) Action
run_full_test "Privacy Pipeline" "mask_emails" '{"message": "Please mail us at support@uni.edu or admin@company.ps"}'

# 5. Passthrough Action (No Transformation)
run_full_test "Direct Pipeline" "passthrough" '{"info": "This data remains unchanged", "version": 1.0}'

# 6. Conditional Filtering Action (Testing two cases)
echo "--- Testing: Filter Pipeline (filter_high_price) ---"
P_FILTER_ID=$(curl -s -X POST "$API_URL/pipelines" -H "Content-Type: application/json" -d '{"name": "Price Filter", "processingType": "filter_high_price"}' | jq -r '.id')
curl -s -X POST "$API_URL/pipelines/$P_FILTER_ID/subscribers" -H "Content-Type: application/json" -d "{\"targetUrl\": \"$TARGET_URL\"}" > /dev/null

echo "  -> Sending Price 150 (Should pass the filter)"
curl -s -X POST "$API_URL/ingest/$P_FILTER_ID" -H "Content-Type: application/json" -d '{"item": "SSD Drive", "price": 150}'

echo "  -> Sending Price 45 (Should be skipped by the worker)"
curl -s -X POST "$API_URL/ingest/$P_FILTER_ID" -H "Content-Type: application/json" -d '{"item": "USB Cable", "price": 45}'
echo -e "✅ Filter tests sent.\n"

# 7. External Integration Formatting (Discord)
run_full_test "Format Pipeline" "format_for_discord" '{"message": "Critical error detected on server A1", "level": "error"}'

# 8. 🔥 Retry Logic Test (Simulating delivery failure)
echo "--- 🔥 Testing: Retry Logic (Expected to Fail) ---"
P_RETRY=$(curl -s -X POST "$API_URL/pipelines" -H "Content-Type: application/json" -d '{"name": "Retry Test", "processingType": "passthrough"}' | jq -r '.id')

# Linking to a dead port to force connection refusal
curl -s -X POST "$API_URL/pipelines/$P_RETRY/subscribers" -H "Content-Type: application/json" -d '{"targetUrl": "http://localhost:9999/dead-link"}' > /dev/null

echo "  -> Sending job to dead URL. Check Worker logs for 3 retry attempts..."
curl -s -X POST "$API_URL/ingest/$P_RETRY" -H "Content-Type: application/json" -d '{"debug": "testing retries"}'

echo -e "\n✨ ALL TESTS EXECUTED! ✨"
echo "Check your Webhook.site and Worker logs to verify the results."