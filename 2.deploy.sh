SECONDS=0

# create service account
gcloud iam service-accounts create "agentic-portal-service" --description="Service account to manage the agentic portal" \
    --display-name="Agentic Portal Service"
# grant rights
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:agentic-portal-service@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:agentic-portal-service@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/eventarc.eventReceiver"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:agentic-portal-service@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/apihub.admin"

gcloud run deploy agentic-portal --source . --project $PROJECT_ID --region $REGION --allow-unauthenticated \
    --set-env-vars "AUTH_API_KEY=$AUTH_API_KEY,AUTH_DOMAIN=$AUTH_DOMAIN"

gcloud eventarc triggers create api-create-trigger --event-filters="type=google.cloud.apihub.api.v1.created" \
    --destination-run-service="agentic-portal" --destination-run-path="/cache-refresh" --location=$REGION --project=$PROJECT_ID \
    --service-account="agentic-portal-service@$PROJECT_ID.iam.gserviceaccount.com"
gcloud eventarc triggers create api-update-trigger --event-filters="type=google.cloud.apihub.api.v1.updated" \
    --destination-run-service="agentic-portal" --destination-run-path="/cache-refresh" --location=$REGION --project=$PROJECT_ID \
    --service-account="agentic-portal-service@$PROJECT_ID.iam.gserviceaccount.com"

duration=$SECONDS
echo "Total deployment finished in $((duration / 60)) minutes and $((duration % 60)) seconds."
