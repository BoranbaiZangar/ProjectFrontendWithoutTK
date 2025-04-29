import React from 'react';
   import { useSelector, useDispatch } from 'react-redux';
   import { logout } from '../redux/auth'; // Matches Navbar's import

   const UserProfile = () => {
     const user = useSelector((state) => state.auth.user); // Changed from state.user to state.auth.user
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
         <div className="space-y-4">
           <div>
             <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Email</h2>
             <p className="text-lg text-[#1A1A1A]">{user.email}</p>
           </div>
           <div>
             <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Role</h2>
             <p className="text-lg text-[#1A1A1A]">{user.role}</p>
           </div>
           <div>
             <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Profile Image</h2>
             <p className="text-lg text-[#1A1A1A] opacity-70">Image upload is not available yet.</p>
           </div>
           <div>
             <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Address</h2>
             <p className="text-lg text-[#1A1A1A] opacity-70">Address addition is not available yet.</p>
           </div>
           <div>
             <h2 className="font-serif text-xl text-[#3E2A1D] mb-2">Edit Profile</h2>
             <p className="text-lg text-[#1A1A1A] opacity-70">Profile editing is not available yet.</p>
           </div>
         </div>
         <button
           className="mt-6 font-serif bg-[#6B1E3A] text-white py-3 px-6 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#C0A062] transform hover:scale-105 transition-all"
           onClick={() => dispatch(logout())}
         >
           Log Out
         </button>
       </div>
     );
   };

   export default UserProfile;