import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentsAPI } from '../../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormInnerProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const CheckoutFormInner = ({ bookingId, amount, onSuccess, onError }: CheckoutFormInnerProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await paymentsAPI.createIntent({ bookingId });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Failed to create payment intent:', error);
        onError('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [bookingId, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'requires_capture') {
        // Payment authorized (on hold)
        onSuccess();
      }
    } catch (error: any) {
      onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💳 Your card will be authorized for ${amount.toFixed(2)}. The charge will be processed after the ride is completed.
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-primary"
      >
        {loading ? 'Processing...' : `Authorize $${amount.toFixed(2)}`}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Payments are securely processed by Stripe
      </p>
    </form>
  );
};

interface CheckoutFormProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const CheckoutForm = (props: CheckoutFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner {...props} />
    </Elements>
  );
};

export default CheckoutForm;

