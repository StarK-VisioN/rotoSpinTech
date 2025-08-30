import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { getProfile } from "../../utils/authService";
import AdminHome from "../adminPage/AdminHome";

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Token failed");
      }
    };

    fetchProfile();
  }, []);

  if (error)
    return (
      <div className="text-center pt-8">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!profile)
    return (
      <div className="text-center pt-8">
        <p>Loading profile...</p>
      </div>
    );

  // ✅ Common welcome block for all users
  const WelcomeBlock = () => (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"HOME"} text2={"PAGE"} />
      </div>
      <div className="text-center mt-8 pb-8">
        <h2 className="text-xl font-semibold">Welcome, {profile.name}</h2>
        <p>Position: {profile.position}</p>
        <p>Working ID: {profile.working_id}</p>
      </div>
    </div>
  );

  // ✅ If the user is admin → render AdminHome + welcome block
  if (profile.position?.toLowerCase() === "admin") {
    return (
      <div>
        <WelcomeBlock />
        <AdminHome />
      </div>
    );
  }

  // ✅ Otherwise → normal home page
  return <WelcomeBlock />;
};

export default Home;
