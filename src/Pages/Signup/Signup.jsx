import { NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../Components/Navbar/Navbar"
import Footer from "../../Components/Footer/Footer";

function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("api for the signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setServerMessage("Signup successful!");
        setIsSuccess(true);
      } else {
        setServerMessage(result.message);
      }
    } catch (error) {
      setServerMessage("Something went wrong.");
    }
  };

  //This will take the user to the login page if the data he/she has provided has been approvided
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  return (
    <div>

      <Navbar  />
      <h2>Signup</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <p>{errors.name.message}</p>}

        <input
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p>{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && <p>{errors.password.message}</p>}

        <button type="submit">Signup</button>
        <p>
          Already have an account?{" "}
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "active-link" : "link")}
          >
            Login
          </NavLink>
        </p>
      </form>
      <Footer/>

      {serverMessage && <p>{serverMessage}</p>}
    </div>
  );
}

export default Signup;
