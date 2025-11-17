SECONDS=0

gcloud run deploy agentic-portal --source . --project $PROJECT_ID --region $REGION --allow-unauthenticated \
    --env-vars-file "./.env" --service-account "agentic-portal-service@$PROJECT_ID.iam.gserviceaccount.com"

duration=$SECONDS
echo "Total deployment finished in $((duration / 60)) minutes and $((duration % 60)) seconds."
