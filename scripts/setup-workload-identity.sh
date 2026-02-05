#!/bin/bash

# Configuration
PROJECT_ID="ke-quoteme-app"
SERVICE_ACCOUNT_NAME="github-deployer"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
REPO="snkgatle/quoteme" # Format: OWNER/REPO

# Enable necessary APIs
gcloud services enable iamcredentials.googleapis.com \
    appengine.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com --project "${PROJECT_ID}"

# Create Service Account
gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
    --display-name="GitHub Actions Deployment SA" \
    --project "${PROJECT_ID}"

# Grant Roles to Service Account
ROLES=(
    "roles/appengine.appAdmin"
    "roles/run.admin"
    "roles/artifactregistry.admin"
    "roles/storage.admin"
    "roles/cloudbuild.builds.editor"
    "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
        --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="${ROLE}"
done

# Create Workload Identity Pool
gcloud iam workload-identity-pools create "${POOL_NAME}" \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --project "${PROJECT_ID}"

# Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
    --location="global" \
    --workload-identity-pool="${POOL_NAME}" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --project "${PROJECT_ID}"

# Allow GitHub to impersonate the Service Account
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --project "${PROJECT_ID}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${REPO}"

# Output the provider identifier
echo "Workload Identity Provider identifier:"
echo "projects/$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
