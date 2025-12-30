// PayPal utility - returns PayPal client ID
export const getPayPalClientId = () => {
    return import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
};

export default getPayPalClientId;

