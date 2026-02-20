import { NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./Signup.module.css";

import Openeye from "../../assets/Icons/eye-open.svg?react";
import Closedeye from "../../assets/Icons/eye-closed.svg?react";

function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

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
    <div className={styles.signup}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h2>
          Create your <span className={styles.shade}>account</span>
        </h2>
        <input
          placeholder="Full Name"
          {...register("name", { required: " Full Name is required" })}
        />
        {errors.name && <p>{errors.name.message}</p>}

        <input
          placeholder="Email Adress"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p>{errors.email.message}</p>}

        <select
          className={styles.options}
          {...register("role", { required: "Role is required" })}
        >
          <option value="">Choose your role</option>
          <option value="user">SMEs</option>
          <option value="admin">NGOs</option>
          <option value="vendor">Sponsors</option>
        </select>

        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            {...register("password", { required: "Password is required" })}
          />
          <span onClick={togglePassword}>
            {showPassword ? <Openeye /> : <Closedeye />}
          </span>
        </div>
        {errors.password && <p>{errors.password.message}</p>}
        <div className={styles.passwordWrapper}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            {...register("password", { required: "Password is required" })}
          />
          <span onClick={() => setShowConfirmPassword((prev) => !prev)}>
            {showConfirmPassword ? <Openeye /> : <Closedeye />}
          </span>
        </div>

        {errors.password && <p>{errors.password.message}</p>}

        <button type="submit">Signup</button>
        <div>
          <div className={styles.termsWrapper}>
            <label>
              <input
                type="checkbox"
                {...register("terms", {
                  required: "You must agree to the Terms and Services",
                })}
              />
              I agree to the Terms and Services
            </label>
          </div>

          {errors.terms && <p>{errors.terms.message}</p>}
          <p>
            Already have an account?{" "}
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "active-link" : "link")}
            >
              <span className="login">Login</span>
            </NavLink>
          </p>
        </div>
      </form>

      {serverMessage && <p>{serverMessage}</p>}
    </div>
  );
}

export default Signup;
