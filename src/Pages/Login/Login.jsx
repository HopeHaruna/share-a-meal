import { NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ImpactCard from "../../Components/ImpactCard/ImpactCard"

import styles from "./Login.module.css";
import Openeye from "../../assets/Icons/eye-open.svg?react";
import Closedeye from "../../assets/Icons/eye-closed.svg?react";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverMessage, setServerMessage] = useState("");
  const [token, setToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("login api from the backend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        setToken(result.token);
      } else {
        setServerMessage(result.message);
      }
    } catch (error) {
      setServerMessage("Something went wrong.");
    }
  };

  // This is want will take the user to the login
  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <div className={styles.login}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h2>
          Welcome <span className={styles.back}>back !</span>
        </h2>
        <input
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p>{errors.email.message}</p>}

        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
          />
          <span onClick={togglePassword}>
            {showPassword ? <Openeye /> : <Closedeye />}
          </span>
        </div>

        {errors.password && <p>{errors.password.message}</p>}

        <button type="submit">Login</button>

        <div>
          <label>
            <input type="checkbox" />
            Remember me
          </label>

          <p>
            Don’t have an account?{" "}
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active-link" : "link")}
            >
              Signup
            </NavLink>
          </p>
        </div>
      </form>
       <ImpactCard
       icon={<Openeye/>}
      title="12K"
     description="Meals Shared"
      />
      {serverMessage && <p>{serverMessage}</p>}
    </div>
  );
}

export default Login;
