import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Dashboard = () => {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Welcome to Dashboard</h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;