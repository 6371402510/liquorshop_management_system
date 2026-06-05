import { useState } from "react";
import {
  Users,
  IndianRupee,
  Building2,
  CalendarDays,
  Wallet,
  Receipt
} from "lucide-react";

export default function IMFLDashboard() {
  const stats = [
    {
      title: "Total Stores",
      value: 4,
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      title: "Employees",
      value: 48,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Present Today",
      value: 45,
      icon: CalendarDays,
      color: "bg-purple-500",
    },
    {
      title: "Cash In Hand",
      value: "₹3,25,000",
      icon: Wallet,
      color: "bg-orange-500",
    },
  ];

  const stores = [
    {
      id: 1,
      name: "Patia Store",
      sales: 185000,
      expense: 12000,
      employees: 12,
    },
    {
      id: 2,
      name: "KIIT Store",
      sales: 225000,
      expense: 18000,
      employees: 10,
    },
    {
      id: 3,
      name: "Nayapalli Store",
      sales: 165000,
      expense: 15000,
      employees: 14,
    },
    {
      id: 4,
      name: "Cuttack Store",
      sales: 210000,
      expense: 17000,
      employees: 12,
    },
  ];

  const attendance = [
    {
      emp: "Ravi Kumar",
      store: "Patia",
      checkin: "09:00",
      status: "Present",
    },
    {
      emp: "Suresh Das",
      store: "KIIT",
      checkin: "09:10",
      status: "Present",
    },
    {
      emp: "Manoj Das",
      store: "Cuttack",
      checkin: "--",
      status: "Absent",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold">
          IMFL Off Shop Operations Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-gray-500">{item.title}</p>
                <h2 className="text-2xl font-bold">{item.value}</h2>
              </div>

              <div className={`${item.color} p-3 rounded-full text-white`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Store Performance */}
      <div className="grid md:grid-cols-2 gap-4 p-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold mb-4">Store Performance</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Store</th>
                <th>Sales</th>
                <th>Expense</th>
                <th>Staff</th>
              </tr>
            </thead>

            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b">
                  <td className="py-2">{store.name}</td>
                  <td>₹{store.sales.toLocaleString()}</td>
                  <td>₹{store.expense.toLocaleString()}</td>
                  <td>{store.employees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold mb-4">Today's Attendance</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Employee</th>
                <th>Store</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((emp, index) => (
                <tr key={index} className="border-b">
                  <td>{emp.emp}</td>
                  <td>{emp.store}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        emp.status === "Present"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense & Payroll */}
      <div className="grid md:grid-cols-2 gap-4 p-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold flex gap-2 items-center mb-4">
            <Receipt size={18} />
            Monthly Expenses
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Salary</span>
              <span>₹8,75,000</span>
            </div>

            <div className="flex justify-between">
              <span>Rent</span>
              <span>₹1,20,000</span>
            </div>

            <div className="flex justify-between">
              <span>Electricity</span>
              <span>₹45,000</span>
            </div>

            <div className="flex justify-between">
              <span>Internet</span>
              <span>₹12,000</span>
            </div>

            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>₹10,52,000</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold flex gap-2 items-center mb-4">
            <IndianRupee size={18} />
            Payroll Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Employees</span>
              <span>48</span>
            </div>

            <div className="flex justify-between">
              <span>Total Salary</span>
              <span>₹8,75,000</span>
            </div>

            <div className="flex justify-between">
              <span>Overtime</span>
              <span>₹25,000</span>
            </div>

            <div className="flex justify-between">
              <span>Incentive</span>
              <span>₹15,000</span>
            </div>

            <div className="flex justify-between font-bold border-t pt-2">
              <span>Net Payroll</span>
              <span>₹9,15,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}