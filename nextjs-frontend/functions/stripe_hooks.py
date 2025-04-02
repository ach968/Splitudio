import os
import stripe
from firebase_functions import https_fn
from firebase_functions.params import StringParam

# Set your Stripe API key and webhook secret from environment variables.
secret_key = "sk_test_51R9UXABHIOhhV1jQ8tYhzHEFRBhHxRx87txxwBoOVFq5oCYOqDAC21qzm8MmAB6SdmV04Gmn76qdYCkuvrDRHAeO00D7Gu1f6A"
endpoint_secret = "whsec_b6b37bb2e40689c6931bab30f38562a97a7abd1cf2b5612fb399dfd96f494095"
@https_fn.on_request(memory=512)
def stripe_webhook(req: https_fn.Request) -> https_fn.Response:
    
    # Get the raw request data as bytes for signature verification
    payload = req.data
    sig_header = req.headers.get("Stripe-Signature")
    
    try:
        # Construct the event using the Stripe library to verify the signature
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        return https_fn.Response("Invalid payload", 400)
    except stripe.error.SignatureVerificationError as e:
        return https_fn.Response("Invalid Signature", 400)

    if event["type"] == "checkout.session.completed":
        checkout_session = event["data"]["object"]
        print("Checkout session:", checkout_session)

        if checkout_session["payment_status"] == "paid":
            # userid added in the frontend
            print("Client id from frontend " + checkout_session["client_reference_id"])
            # save this so we know when they cancel
            print("Save this for subscription cancelation " + checkout_session["subscription"])

    elif event["type"] == "customer.subscription.deleted":
        cancel_intent = event["data"]["object"]
        print("Subscription cancelled:", cancel_intent)

        print("Subscription cancelation " + cancel_intent["subscription"])
    
    else:
        print("Unhandled event type:", event["type"])
    
    return https_fn.Response("Done", status=200)
