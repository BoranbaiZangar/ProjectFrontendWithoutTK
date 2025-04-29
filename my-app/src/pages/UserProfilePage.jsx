import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/auth';
import AvatarSection from '../components/profile/AvatarSection';
import AddressesSection from '../components/profile/AddressesSection';
import PaymentMethodsSection from '../components/profile/PaymentMethodsSection';
import OrderStatsSection from '../components/profile/OrderStatsSection';
import SecuritySettingsSection from '../components/profile/SecuritySettingsSection';
import ReviewsSection from '../components/profile/ReviewsSection';

export default function UserProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-tl-[20px] rounded-br-[20px] shadow-lg border border-gray-100 transform -rotate-1">
        <h1 className="font-serif text-3xl text-[#3E2A1D] mb-6 transform -skew-x-3">User Profile</h1>
        <p className="text-lg text-[#1A1A1A] opacity-70">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-tl-[20px] rounded-br-[20px] shadow-lg border border-gray-100 transform -rotate-1">
      <h1 className="font-serif text-3xl text-[#3E2A1D] mb-6 transform -skew-x-3">User Profile</h1>
      <AvatarSection initialAvatar={user.avatarUrl} />
      <AddressesSection initialAddresses={user.addresses} />
      <PaymentMethodsSection initialPayments={user.payments} />
      <OrderStatsSection initialStats={user.stats} />
      <SecuritySettingsSection />
      <ReviewsSection />
      <button
        className="mt-6 font-serif bg-[#6B1E3A] text-white py-3 px-6 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#C0A062] transform hover:scale-105 transition-all"
        onClick={() => dispatch(logout())}
      >
        Log Out
      </button>
    </div>
  );
}