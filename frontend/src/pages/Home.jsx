import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getProfile } from "../../utils/authService";

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

  if (error) return <p className="text-red-500">{error}</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h1>Welcome, {profile.name}</h1>
      <p>Position: {profile.position}</p>
      <p>Working ID: {profile.working_id}</p>
    </div>
  );
};

export default Home;
