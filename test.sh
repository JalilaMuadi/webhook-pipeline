#!/bin/bash

TARGET_URL="https://webhook.site/1122ccb5-12a9-4d2a-acf9-e0e25013e7fd"
API_URL="http://localhost:5000/api"

echo "🚀 Starting Webhook Pipeline Test..."

echo "📦 Creating Privacy Pipeline (mask_emails)..."
PIPELINE_JSON=$(curl -s -X POST "$API_URL/pipelines" \
     -H "Content-Type: application/json" \
     -d '{"name": "Privacy Pipeline", "processingType": "mask_emails"}')

PIPELINE_ID=$(echo $PIPELINE_JSON | jq -r '.id')

echo "✅ Pipeline created with ID: $PIPELINE_ID"

echo "🔗 Adding Subscriber..."
curl -s -X POST "$API_URL/pipelines/$PIPELINE_ID/subscribers" \
     -H "Content-Type: application/json" \
     -d "{\"targetUrl\": \"$TARGET_URL\"}" > /dev/null

echo "✅ Subscriber linked to $TARGET_URL"

echo "📨 Sending test payload with emails..."
curl -s -X POST "$API_URL/ingest/$PIPELINE_ID" \
     -H "Content-Type: application/json" \
     -d '{"user": "Jalila", "email": "jalila@example.com", "note": "contact me at dev@university.edu"}'

echo -e "\n\n✨ Done! Check your Webhook.site to see the masked emails."