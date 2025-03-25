// // src/pages/CreateExpense.js
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { getGroup, createExpense } from '../api';
// import { toast } from 'react-toastify';
//
// const CreateExpense = () => {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//
//   const [description, setDescription] = useState('Coffee Run');
//   const [paidBy, setPaidBy] = useState('');
//   const [items, setItems] = useState([]);
//   const [group, setGroup] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//
//   useEffect(() => {
//     const loadGroup = async () => {
//       try {
//         const groupData = await getGroup(groupId);
//         setGroup(groupData);
//
//         // Initialize items with zero amounts for all members
//         const initialItems = groupData.members.map(member => ({
//           user_id: member.id,
//           user_name: member.name,
//           amount: '',
//           description: ''
//         }));
//
//         setItems(initialItems);
//
//         // Set the first member as the default payer
//         if (groupData.members.length > 0) {
//           setPaidBy(groupData.members[0].id.toString());
//         }
//
//         setIsLoading(false);
//       } catch (error) {
//         toast.error('Failed to load group data');
//         navigate('/dashboard');
//       }
//     };
//
//     loadGroup();
//   }, [groupId, navigate]);
//
//   const updateItemAmount = (userId, amount) => {
//     setItems(items.map(item =>
//       item.user_id === userId ? { ...item, amount: amount } : item
//     ));
//   };
//
//   const updateItemDescription = (userId, desc) => {
//     setItems(items.map(item =>
//       item.user_id === userId ? { ...item, description: desc } : item
//     ));
//   };
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//
//     // Validate inputs
//     const nonZeroItems = items.filter(item => parseFloat(item.amount) > 0);
//
//     if (nonZeroItems.length === 0) {
//       toast.error('At least one item with an amount is required');
//       return;
//     }
//
//     if (!paidBy) {
//       toast.error('Select who paid for this expense');
//       return;
//     }
//
//     setIsSubmitting(true);
//
//     try {
//       // Format items to have numeric amounts
//       const formattedItems = nonZeroItems.map(item => ({
//         user_id: item.user_id,
//         amount: parseFloat(item.amount),
//         description: item.description
//       }));
//
//       // Create the expense
//       await createExpense({
//         user_id: parseInt(paidBy),
//         group_id: parseInt(groupId),
//         amount: formattedItems.reduce((sum, item) => sum + item.amount, 0),
//         description
//       });
//
//       toast.success('Expense added successfully!');
//       navigate(`/groups/${groupId}`);
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//
//   return (
//     <div className="min-h-screen bg-gray-100 p-6 coffee-bg">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Expense</h1>
//
//         <div className="card">
//           <form onSubmit={handleSubmit}>
//             <div className="mb-4">
//               <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
//               <input
//                 type="text"
//                 id="description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="input"
//                 placeholder="e.g., Coffee Run"
//                 required
//               />
//             </div>
//
//             <div className="mb-4">
//               <label htmlFor="paidBy" className="block text-gray-700 mb-2">Paid By</label>
//               <select
//                 id="paidBy"
//                 value={paidBy}
//                 onChange={(e) => setPaidBy(e.target.value)}
//                 className="input"
//                 required
//               >
//                 {group?.members.map(member => (
//                   <option key={member.id} value={member.id}>{member.name}</option>
//                 ))}
//               </select>
//             </div>
//
//             <div className="mb-6">
//               <label className="block text-gray-700 mb-2">Items</label>
//               {items.map(item => (
//                 <div key={item.user_id} className="mb-4">
//                   <div className="flex items-center mb-2">
//                     <span className="font-semibold">{item.user_name}</span>
//                   </div>
//                   <div className="flex gap-4">
//                     <input
//                       type="number"
//                       value={item.amount}
//                       onChange={(e) => updateItemAmount(item.user_id, e.target.value)}
//                       className="input"
//                       placeholder="Amount"
//                       required
//                     />
//                     <input
//                       type="text"
//                       value={item.description}
//                       onChange={(e) => updateItemDescription(item.user_id, e.target.value)}
//                       className="input"
//                       placeholder="Description"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//
//             <div className="flex gap-4">
//               <button
//                 type="button"
//                 onClick={() => navigate(`/groups/${groupId}`)}
//                 className="button bg-gray-300 text-gray-700 hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="button"
//               >
//                 {isSubmitting ? 'Submitting...' : 'Add Expense'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default CreateExpense;