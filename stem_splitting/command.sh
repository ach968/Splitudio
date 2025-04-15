MODEL_NAME="stem-splitting-model"
ENDPOINT_NAME="stem-splitting-endpoint"
REGION="us-central1" 

MODEL_ID=$(gcloud ai models list --region=$REGION --filter="displayName=$MODEL_NAME" --format="value(name)")
ENDPOINT_ID=$(gcloud ai endpoints list --region=$REGION --filter="displayName=$ENDPOINT_NAME" --format="value(name)")
DEPLOYED_MODEL_ID=$(gcloud ai endpoints describe $ENDPOINT_ID --region=$REGION --format="value(deployedModels[0].id)")

gcloud ai endpoints deploy-model $ENDPOINT_ID \
  --region=$REGION \
  --model=$MODEL_ID \
  --display-name=$MODEL_NAME-deployed \
  --machine-type=n1-standard-16 \
  --accelerator=count=1,type=nvidia-tesla-t4


# Optional: Update traffic split after successful deployment
# gcloud ai endpoints update $ENDPOINT_ID \
#   --region=$REGION \
#   --traffic-split="$DEPLOYED_MODEL_ID=100"
#   --deployed-models="$DEPLOYED_MODEL_ID" 