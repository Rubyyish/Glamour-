# 💳 Stripe Test Card Numbers - Complete Guide

## 🎯 Quick Reference - Most Common Test Cards

### ✅ Successful Payment (Use This Most Often)
```
Card Number:  4242 4242 4242 4242
Expiry:       Any future date (e.g., 12/25)
CVC:          Any 3 digits (e.g., 123)
ZIP:          Any 5 digits (e.g., 12345)
```

### ❌ Card Declined
```
Card Number:  4000 0000 0000 0002
Expiry:       Any future date
CVC:          Any 3 digits
ZIP:          Any 5 digits
```

### ⚠️ Insufficient Funds
```
Card Number:  4000 0000 0000 9995
Expiry:       Any future date
CVC:          Any 3 digits
ZIP:          Any 5 digits
```

---

## 📋 Complete Test Card List

### 1. Successful Payments

| Card Number | Description | Use Case |
|-------------|-------------|----------|
| `4242 4242 4242 4242` | Visa - Always succeeds | General testing |
| `4000 0566 5566 5556` | Visa (debit) | Test debit cards |
| `5555 5555 5555 4444` | Mastercard | Test Mastercard |
| `2223 0031 2200 3222` | Mastercard (2-series) | New Mastercard format |
| `3782 822463 10005` | American Express | Test Amex (4 digit CVC) |
| `6011 1111 1111 1117` | Discover | Test Discover |
| `3056 9300 0902 0004` | Diners Club | Test Diners |
| `6200 0000 0000 0005` | UnionPay | Test UnionPay |

### 2. Payment Failures

| Card Number | Error Type | Message |
|-------------|------------|---------|
| `4000 0000 0000 0002` | Generic decline | "Your card was declined" |
| `4000 0000 0000 9995` | Insufficient funds | "Insufficient funds" |
| `4000 0000 0000 9987` | Lost card | "Your card has been declined" |
| `4000 0000 0000 9979` | Stolen card | "Your card has been declined" |
| `4000 0000 0000 0069` | Expired card | "Your card has expired" |
| `4000 0000 0000 0127` | Incorrect CVC | "Your card's security code is incorrect" |
| `4000 0000 0000 0119` | Processing error | "An error occurred while processing your card" |

### 3. Special Test Cases

| Card Number | Behavior | Use Case |
|-------------|----------|----------|
| `4000 0025 0000 3155` | Requires authentication (3D Secure) | Test SCA/3DS |
| `4000 0027 6000 3184` | Authentication required but fails | Test failed auth |
| `4000 0000 0000 0341` | Attaching to customer fails | Test customer errors |
| `4000 0000 0000 9235` | Charge succeeds but dispute created | Test disputes |

---

## 🌍 International Test Cards

### India
```
Card Number:  4000 0035 6000 0008
Type:         Visa (India)
```

### Brazil
```
Card Number:  4000 0007 6000 0002
Type:         Visa (Brazil)
```

### Mexico
```
Card Number:  4000 0048 4000 0008
Type:         Visa (Mexico)
```

### Canada
```
Card Number:  4000 0012 4000 0000
Type:         Visa (Canada)
```

---

## 💡 Important Rules for Test Cards

### ✅ What Works
- **Expiry Date**: Any date in the future (e.g., 12/25, 01/30)
- **CVC**: Any 3 digits for Visa/MC/Discover (e.g., 123, 456)
- **CVC**: Any 4 digits for American Express (e.g., 1234)
- **ZIP/Postal Code**: Any valid format (e.g., 12345, 10001)
- **Name**: Any name (e.g., "Test User", "John Doe")

### ❌ What Doesn't Work
- Real card numbers (will be rejected)
- Past expiry dates (will fail)
- Invalid card number formats

---

## 🧪 Testing Different Scenarios

### Scenario 1: Successful Purchase
```
1. Use: 4242 4242 4242 4242
2. Expiry: 12/25
3. CVC: 123
4. ZIP: 12345
5. Result: ✅ Payment succeeds
```

### Scenario 2: Declined Card
```
1. Use: 4000 0000 0000 0002
2. Expiry: 12/25
3. CVC: 123
4. ZIP: 12345
5. Result: ❌ "Your card was declined"
```

### Scenario 3: Insufficient Funds
```
1. Use: 4000 0000 0000 9995
2. Expiry: 12/25
3. CVC: 123
4. ZIP: 12345
5. Result: ❌ "Insufficient funds"
```

### Scenario 4: Expired Card
```
1. Use: 4000 0000 0000 0069
2. Expiry: 12/25
3. CVC: 123
4. ZIP: 12345
5. Result: ❌ "Your card has expired"
```

---

## 🎬 Step-by-Step Testing Guide

### Test a Successful Payment

1. **Go to Collections page**
2. **Click on any item** → "View Item"
3. **Click "Buy Now"**
4. **You'll be redirected to Stripe Checkout**
5. **Enter test card details**:
   ```
   Email:        test@example.com
   Card Number:  4242 4242 4242 4242
   MM/YY:        12/25
   CVC:          123
   Name:         Test User
   Country:      United States
   ZIP:          12345
   ```
6. **Click "Pay"**
7. **You'll be redirected to success page** ✅

### Test a Failed Payment

1. **Follow steps 1-4 above**
2. **Enter declined card**:
   ```
   Email:        test@example.com
   Card Number:  4000 0000 0000 0002
   MM/YY:        12/25
   CVC:          123
   Name:         Test User
   ZIP:          12345
   ```
3. **Click "Pay"**
4. **See error message**: "Your card was declined" ❌

---

## 🔢 Easy-to-Remember Test Cards

### The "4242" Card (Most Common)
```
4242 4242 4242 4242
```
**Tip**: Just type "4242" four times!

### The "0002" Card (Declined)
```
4000 0000 0000 0002
```
**Tip**: "4000" + seven zeros + "0002"

### The "9995" Card (No Funds)
```
4000 0000 0000 9995
```
**Tip**: "4000" + seven zeros + "9995"

---

## 📱 Mobile Testing

Same cards work on mobile! Just enter:
```
Card:   4242 4242 4242 4242
Expiry: 12/25
CVC:    123
```

---

## 🎓 Testing Best Practices

### 1. Test Multiple Scenarios
- ✅ Successful payment
- ❌ Declined card
- ⚠️ Insufficient funds
- 🔒 3D Secure (if enabled)

### 2. Test Different Card Types
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`

### 3. Check Transaction in Admin Dashboard
After test payment:
1. Log in as admin
2. Go to Admin Dashboard
3. Click "Transactions" tab
4. Verify transaction appears ✅

### 4. Test Webhooks (Optional)
- Successful payment triggers webhook
- Check backend logs for webhook events
- Verify transaction status updates

---

## 🚨 Common Mistakes

### ❌ Using Real Card Numbers
**Don't**: Use your actual credit card
**Do**: Use test cards like 4242 4242 4242 4242

### ❌ Using Past Dates
**Don't**: Expiry 01/20 (past date)
**Do**: Expiry 12/25 (future date)

### ❌ Testing in Production
**Don't**: Use test cards in live mode
**Do**: Use test cards only in test mode

---

## 🔐 Security Notes

### Test Mode vs Live Mode
- **Test Mode**: Uses test cards, no real money
- **Live Mode**: Uses real cards, real money
- Your app is in **Test Mode** (safe to test)

### Test Card Safety
- ✅ Test cards are safe to use
- ✅ No real money is charged
- ✅ Can't be used for real purchases
- ✅ Only work in Stripe test mode

---

## 📊 Amounts to Test

You can test any amount! Try these:

| Amount | Purpose |
|--------|---------|
| $0.50 | Minimum amount |
| $10.00 | Small purchase |
| $45.00 | Medium purchase |
| $100.00 | Large purchase |
| $999.99 | Maximum test |

---

## 🎯 Quick Test Checklist

- [ ] Test successful payment (4242 4242 4242 4242)
- [ ] Test declined card (4000 0000 0000 0002)
- [ ] Test insufficient funds (4000 0000 0000 9995)
- [ ] Verify transaction in admin dashboard
- [ ] Check payment success page
- [ ] Test on mobile (optional)
- [ ] Test different card types (optional)

---

## 📞 Need Help?

### Stripe Test Mode Dashboard
- View all test payments
- See webhook events
- Check logs
- URL: https://dashboard.stripe.com/test/payments

### Common Issues

**Issue**: "Card number is invalid"
**Solution**: Make sure you're using a valid test card number

**Issue**: "Your card was declined"
**Solution**: This is expected for card `4000 0000 0000 0002`

**Issue**: "Payment not appearing in dashboard"
**Solution**: Check you're logged in as admin

---

## 🎉 Ready to Test!

**Your go-to test card**:
```
💳 4242 4242 4242 4242
📅 12/25
🔒 123
📮 12345
```

Just copy these values into the Stripe checkout form and you're good to go! ✅

---

## 📚 Additional Resources

- [Stripe Test Cards Documentation](https://stripe.com/docs/testing)
- [Stripe Dashboard (Test Mode)](https://dashboard.stripe.com/test)
- [Stripe API Logs](https://dashboard.stripe.com/test/logs)

---

**Pro Tip**: Bookmark this page for quick reference during testing! 🔖

**Last Updated**: May 31, 2026
