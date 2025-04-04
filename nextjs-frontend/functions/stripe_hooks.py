import os
import stripe
from dotenv import load_dotenv
from firebase_functions import https_fn
from firebase_functions.params import StringParam

@https_fn.on_request(memory=512)
def stripe_webhook(req: https_fn.Request) -> https_fn.Response:
    
    load_dotenv()
    endpoint_secret = os.getenv("ENDPOINT_SECRET")

    payload = req.data
    sig_header = req.headers.get("Stripe-Signature")
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        return https_fn.Response("Invalid payload", 400)
    except stripe.error.SignatureVerificationError as e:
        return https_fn.Response("Invalid Signature", 400)

    # user subscribes
    if event["type"] == "checkout.session.completed":
        checkout_session = event["data"]["object"]
        print("Checkout session:", checkout_session)

        if checkout_session["payment_status"] == "paid":
            # userid added in the frontend
            print("Client id from frontend " + checkout_session["client_reference_id"])
            
            # save this so we know when they cancel
            print("Save this for subscription cancelation " + checkout_session["subscription"])
   
    # user unsubscribes
    elif event["type"] == "customer.subscription.deleted":
        cancel_intent = event["data"]["object"]
        print("Subscription cancelled:", cancel_intent)

        print("Subscription cancelation " + cancel_intent["subscription"])
    
    else:
        print("Unhandled event type:", event["type"])
    
    return https_fn.Response("Done", status=200)
