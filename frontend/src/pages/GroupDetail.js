import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createExpense,
  getDetailedDebts,
  getGroup,
  getGroupBalances,
  getNextPayer,
  getTransactionHistory,
  updateExpensePayer,
} from "../api";
import { toast } from "react-toastify";
import "./GroupDetail.css";

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [nextPayer, setNextPayer] = useState(null);
  const [balances, setBalances] = useState([]);
  const [detailedDebts, setDetailedDebts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseItems, setExpenseItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayerConfirmation, setShowPayerConfirmation] = useState(false);
  const [latestExpenseId, setLatestExpenseId] = useState(null);
  const [latestExpenseTotal, setLatestExpenseTotal] = useState(0);
  const [selectedPayer, setSelectedPayer] = useState(null);
  const [expenseSubmitted, setExpenseSubmitted] = useState(false);

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setIsLoading(true);

        const groupData = await getGroup(groupId);
        setGroup(groupData);

        const initialItems = groupData.members.map((member) => ({
          user_id: member.id,
          user_name: member.name,
          amount: "",
          description: "",
        }));
        setExpenseItems(initialItems);

        await loadFinancialData(groupId);
      } catch (error) {
        toast.error("Failed to load group data");
        console.error("Error loading group:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [groupId]);

  const loadFinancialData = async (groupId) => {
    try {
      const [balancesData, debtsData, transactionsData, nextPayerData] =
        await Promise.all([
          getGroupBalances(groupId),
          getDetailedDebts(groupId),
          getTransactionHistory(groupId),
          getNextPayer(groupId),
        ]);

      setBalances(balancesData);
      setDetailedDebts(debtsData);
      setTransactions(transactionsData);
      setNextPayer(nextPayerData.next_payer);
    } catch (error) {
      toast.error("Failed to load financial data");
      console.error("Error loading financial data:", error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    const validItems = expenseItems.filter((item) => item.amount > 0);
    if (validItems.length === 0) {
      toast.error("At least one member must have a cost greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        group_id: groupId,
        paid_by: null,
        description: expenseDescription,
        items: validItems,
      };

      const createdExpense = await createExpense(expenseData);
      const total = validItems.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
      );

      setLatestExpenseId(createdExpense.id);
      setLatestExpenseTotal(total);

      await loadFinancialData(groupId);

      const nextPayerResponse = await getNextPayer(groupId);
      setNextPayer(nextPayerResponse.next_payer);
      setSelectedPayer(nextPayerResponse.next_payer?.id);

      setShowPayerConfirmation(true);
      setExpenseSubmitted(true);
      toast.success("Expense added! Please confirm who paid.");
    } catch (error) {
      toast.error("Failed to add expense");
      console.error("Error adding expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayer = async (payerId) => {
    if (!payerId) {
      toast.error("Please select a payer");
      return;
    }

    try {
      await updateExpensePayer(latestExpenseId, { paid_by: payerId });
      toast.success("Payment recorded!");

      await loadFinancialData(groupId);
      resetExpenseForm();
    } catch (error) {
      toast.error("Failed to confirm payer");
      console.error("Error confirming payer:", error);
    }
  };

  const resetExpenseForm = () => {
    setExpenseDescription("");
    setExpenseItems(
      group.members.map((member) => ({
        user_id: member.id,
        user_name: member.name,
        amount: "",
        description: "",
      }))
    );
    setShowPayerConfirmation(false);
    setExpenseSubmitted(false);
    setSelectedPayer(null);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const updateItemAmount = (userId, value) => {
    // Allow empty input for clearing the field
    if (value === "") {
      setExpenseItems(
        expenseItems.map((item) =>
          item.user_id === userId ? { ...item, amount: "" } : item
        )
      );
      return;
    }

    // Sanitize input: only allow digits and a single decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, ""); // Remove all characters except digits and decimal point
    const decimalCount = sanitizedValue.split(".").length - 1;

    if (decimalCount > 1) {
      // If more than one decimal point, reject the input
      toast.error("Only one decimal point is allowed");
      return;
    }

    // Parse the sanitized value as a float
    const amount = parseFloat(sanitizedValue);

    // Validate the amount
    if (isNaN(amount) || amount < 0) {
      toast.error("Amount must be a positive number");
      return;
    }

    // Update the state with the sanitized and validated amount
    setExpenseItems(
      expenseItems.map((item) =>
        item.user_id === userId ? { ...item, amount: sanitizedValue } : item
      )
    );
  };

  const updateItemDescription = (userId, description) => {
    setExpenseItems(
      expenseItems.map((item) =>
        item.user_id === userId ? { ...item, description } : item
      )
    );
  };

  if (isLoading) {
    return <div className="group-detail-container">Loading...</div>;
  }

  return (
    <div className="group-detail-container">
      <div className="group-detail-content">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{group?.name}</h1>

        <div className="layout-grid">
          {/* Left Side: Add Expense Form or Payer Confirmation */}
          <div className="card expense-card">
            {!expenseSubmitted ? (
              <>
                <h2>Add Expense</h2>
                <form onSubmit={handleAddExpense}>
                  <div className="mb-2">
                    <label
                      htmlFor="description"
                      className="block text-gray-700 text-sm mb-1"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      className="input-field compact-input"
                      placeholder="e.g., Coffee after lunch"
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <h3 className="text-sm">Individual Costs</h3>
                    {expenseItems.map((item) => (
                      <div
                        key={item.user_id}
                        className="expense-item compact-expense-item"
                      >
                        <label
                          htmlFor={`amount-${item.user_id}`}
                          className="text-sm"
                        >
                          {item.user_name}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text" // Changed to text to better control input
                            id={`amount-${item.user_id}`}
                            value={item.amount || ""}
                            onChange={(e) =>
                              updateItemAmount(item.user_id, e.target.value)
                            }
                            className="input-field compact-input"
                            placeholder="Amount"
                            step="0.01"
                          />
                          <input
                            type="text"
                            id={`description-${item.user_id}`}
                            value={item.description || ""}
                            onChange={(e) =>
                              updateItemDescription(
                                item.user_id,
                                e.target.value
                              )
                            }
                            className="input-field compact-input"
                            placeholder="Description (optional)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="button compact-button"
                  >
                    {isSubmitting ? "Adding..." : "Add Expense"}
                  </button>
                </form>
              </>
            ) : (
              <div className="payer-confirmation">
                <h2>Confirm Who Paid</h2>
                <div className="expense-summary">
                  <p className="text-sm mb-2">
                    <span className="font-semibold">{expenseDescription}</span>{" "}
                    -
                    <span className="font-bold ml-2">
                      ${latestExpenseTotal.toFixed(2)}
                    </span>
                  </p>
                </div>

                {nextPayer && (
                  <div className="suggested-payer-card">
                    <h3 className="text-sm">Suggested Payer</h3>
                    <div className="flex items-center justify-center gap-4 mb-2">
                      <div className="payer-avatar">
                        {getInitials(nextPayer.name)}
                      </div>
                      <div className="payer-details">
                        <p className="font-bold text-sm">{nextPayer.name}</p>
                        <p className="text-xs text-gray-600">
                          Owes the most in the group
                        </p>
                      </div>
                    </div>

                    <button
                      className="button compact-button w-full mb-2"
                      onClick={() => handleConfirmPayer(nextPayer.id)}
                    >
                      {nextPayer.name} Paid
                    </button>

                    <div className="alternative-prompt">
                      <p className="text-center mb-1 text-xs">- or -</p>
                      <p className="text-center mb-1 text-xs">
                        Someone else paid?
                      </p>
                    </div>

                    <div className="payer-selection">
                      {group?.members.map(
                        (member) =>
                          member.id !== nextPayer.id && (
                            <div
                              key={member.id}
                              className={`payer-option ${
                                selectedPayer === member.id ? "selected" : ""
                              }`}
                              onClick={() => setSelectedPayer(member.id)}
                            >
                              <div className="payer-option-avatar">
                                {getInitials(member.name)}
                              </div>
                              <span className="text-xs">{member.name}</span>
                            </div>
                          )
                      )}
                    </div>

                    <button
                      className="alt-button compact-button w-full mt-2"
                      onClick={() => handleConfirmPayer(selectedPayer)}
                      disabled={
                        !selectedPayer || selectedPayer === nextPayer.id
                      }
                    >
                      Confirm Different Payer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Balances and Transaction History */}
          <div className="right-side-container">
            <div className="card balance-card">
              <h2 className="sticky top-0 bg-white z-10 pb-2 border-b">
                Balances
              </h2>
              <div className="balance-scroll-container">
                <ul className="space-y-2">
                  {balances.map((balance) => (
                    <li
                      key={balance.user_id}
                      className="balance-item flex items-center p-2 rounded-lg"
                    >
                      <div
                        className="debtor-avatar mr-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                        style={{
                          backgroundColor: "#8B4513", // Brown color similar to the image
                        }}
                      >
                        {getInitials(balance.user_name)}
                      </div>
                      <div className="balance-info flex-grow flex items-center">
                        <div className="flex-grow">
                          <span className="font-medium mr-2">
                            {balance.user_name}&nbsp;
                          </span>
                          <span
                            className={`font-medium ${
                              balance.balance > 0
                                ? "owedgreen"
                                : balance.balance < 0
                                ? "owesred"
                                : "allsettled"
                            }`}
                          >
                            {balance.balance > 0
                              ? "is owed "
                              : balance.balance < 0
                              ? "owes "
                              : "settled"}
                          </span>
                        </div>
                        &nbsp;
                        <span className="font-bold">
                          ${Math.abs(balance.balance).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card transaction-history-card">
              <h2>Transaction History</h2>
              <ul className="transaction-list">
                {transactions.map((transaction) => (
                  <li key={transaction.id} className="transaction-item">
                    <div className="transaction-header">
                      <div className="font-bold">
                        {transaction.description} - Paid by{" "}
                        {transaction.paid_by_name} ($
                        {transaction.total?.toFixed(2) || "0.00"})
                      </div>
                      <div className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <ul className="transaction-details">
                      {transaction.items.map((item) => (
                        <li key={item.user_id} className="flex justify-between">
                          <span>{item.user_name}</span>
                          <span>${item.amount?.toFixed(2) || "0.00"}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Debts Section */}
        <div className="card detailed-debts">
          <h2>Detailed Debts</h2>
          <div className="debts-grid">
            {detailedDebts.map((debt) => {
              const total = debt.owes_to.reduce(
                (sum, owe) => sum + owe.amount,
                0
              );

              return (
                <div key={debt.debtor_id} className="debt-card">
                  <div className="debt-header">
                    <div className="debtor-avatar">
                      {getInitials(debt.debtor_name)}
                    </div>
                    <div className="debtor-info">
                      <h3>{debt.debtor_name} Owes</h3>
                      {debt.status === "settled" ? (
                        <span className="settled-badge">Settled up!</span>
                      ) : (
                        <span className="total-balance">
                          Total:{" "}
                          <span className="owes">
                            ${Math.abs(total).toFixed(2)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {debt.status !== "settled" && (
                    <ul className="debt-details">
                      {debt.owes_to.map((owe) => (
                        <li key={owe.user_id} className="debt-item">
                          <div className="debt-avatar">
                            {getInitials(owe.user_name)}
                          </div>
                          <div className="debt-info">
                            <span>{owe.user_name}</span>
                            <span
                              className={`amount ${
                                owe.amount > 0 ? "owed" : "owes"
                              }`}
                            >
                              ${Math.abs(owe.amount).toFixed(2)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GroupDetail;
