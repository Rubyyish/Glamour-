# Quick Test Guide - Favorites & Payment

## 🚀 Quick Start Testing

### Test Favorites Feature (2 minutes)

1. **Go to Collections Page**
   - Navigate to `/collections` or click "Collections" from home

2. **Click Heart Icon**
   - Look for heart icon in top-right of any item card
   - Click it once → Heart should turn RED ❤️
   - Toast message: "Added to favorites"

3. **Click Again to Unfavorite**
   - Click the red heart again
   - Heart should become outline only 🤍
   - Toast message: "Removed from favorites"

4. **Test Persistence**
   - Favorite 2-3 items
   - Refresh the page (F5)
   - Hearts should still be RED for favorited items ✅

5. **Test on Category Pages**
   - Go to `/category/trousers` or `/category/shirts`
   - Favorite some items there
   - Go back to Collections
   - Verify favorites sync across pages

---

### Test Payment Fix (3 minutes)

1. **Make Sure You're Logged In**
   - Check if your name appears in top-right
   - If not, log in first

2. **Click on Any Item**
   - Click "VIEW ITEM" on any product card
   - Full-page detail view opens

3. **Click "Buy Now"**
   - Scroll to action buttons
   - Click "💳 Buy Now — $XX"
   - Should redirect to Stripe checkout page ✅

4. **Test Without Login** (Optional)
   - Log out
   - Try to buy an item
   - Should redirect to login page with error message

5. **Complete Test Payment** (Optional)
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Complete payment
   - Should redirect to success page

---

## 🐛 Troubleshooting

### Favorites Not Working?
- **Check Console**: Press F12 → Console tab
- **Check Login**: Make sure you're logged in
- **Check Backend**: Is backend server running?
- **Check Network**: F12 → Network tab → Look for `/favorites` calls

### Payment Not Working?
- **Check Console**: Look for error messages
- **Check Token**: Open DevTools → Application → Local Storage → Look for "token"
- **Check Backend**: Is backend server running on port 3001?
- **Check Stripe Key**: Is `STRIPE_SECRET_KEY` set in backend `.env`?

### Common Errors

| Error | Solution |
|-------|----------|
| "Failed to update favorites" | Check if backend is running |
| "Please log in to make a purchase" | Log in first |
| "Failed to initiate payment" | Check Stripe key in backend .env |
| Heart icon not showing | Clear browser cache (Ctrl+Shift+R) |
| Toast not appearing | Check if react-toastify is working |

---

## ✅ Expected Behavior

### Favorites
- ✅ Heart icon visible on all item cards
- ✅ Click toggles favorite status
- ✅ Red heart = favorited
- ✅ Outline heart = not favorited
- ✅ Toast notification on every click
- ✅ Favorites persist after refresh
- ✅ Favorites sync across Collections and Category pages

### Payment
- ✅ "Buy Now" button works when logged in
- ✅ Redirects to Stripe checkout
- ✅ Shows item name and price correctly
- ✅ Redirects to login if not authenticated
- ✅ Transaction saved in database
- ✅ Admin can see transaction in dashboard

---

## 📱 Mobile Testing

1. Open on mobile browser or use DevTools mobile view
2. Test favorite button (should be easy to tap)
3. Test payment flow
4. Verify responsive design

---

## 🎯 Success Criteria

You'll know everything works when:
- [ ] Can favorite/unfavorite items with one click
- [ ] Hearts stay red after page refresh
- [ ] Payment redirects to Stripe checkout
- [ ] No console errors
- [ ] Toast notifications appear
- [ ] Works on both Collections and Category pages

---

## 🔥 Quick Demo Flow

**Show someone the features in 60 seconds:**

1. "Watch this - I can favorite items" → Click heart
2. "See? It turns red" → Heart fills
3. "And I can unfavorite" → Click again
4. "It even remembers after refresh" → Refresh page
5. "Now let me buy something" → Click item → Buy Now
6. "Takes me straight to checkout" → Stripe page loads

Done! 🎉

---

## 📞 Need Help?

1. Check `FAVORITES_AND_PAYMENT_FIX.md` for detailed documentation
2. Check browser console for error messages
3. Check backend logs for API errors
4. Verify all environment variables are set
5. Make sure both frontend and backend are running

---

**Happy Testing! 🚀**
