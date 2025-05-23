import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import fetchApi from "../../api/fetchApi";

import BlackButton from "../../components/commons/BlackButton/BlackButton";
import Input from "../../components/commons/Input/Input";
import SideImage from "../../components/SideImage/SideImage";

import "./SignUp.css";

const schema = yup
  .object({
    firstname: yup.string().required("Firstname is required"),
    lastname: yup.string().required("Lastname is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must be less than 50 characters")
      .required("Password is required"),
  })
  .required();

function SignUp() {
  const { state: prevPage } = useLocation();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // TODO: Uncomment when Api is available
      const user = await fetchApi({
        method: "post",
        url: "/users",
        data: data,
      });

      // const user = { id: 1, ...data }; //Created to try toast and redirection, delete when call is available or when checking errors

      if (user) {
        toast.success("Account created successfully, redirecting to Login...");
        setTimeout(() => {
          navigate("/login");
        }, 4000);
      } else {
        navigate(prevPage ? prevPage : "/");
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message || "An error occurred", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  return (
    <SideImage>
      <div className="signup-container">
        <form action="" onSubmit={handleSubmit(onSubmit)} className="w-100 px-4">
          <div className="">
            <Input
              type="firstname"
              name="firstname"
              id="firstname"
              label="Firstname"
              register={{ ...register("firstname") }}
              errors={errors}
              classNameLabel="fw-semibold"
            />
          </div>
          <div className="mt-4">
            <Input
              type="lastname"
              name="lastname"
              id="lastname"
              label="Lastname"
              register={{ ...register("lastname") }}
              errors={errors}
              classNameLabel="fw-semibold"
            />
          </div>
          <div className="mt-4">
            <Input
              type="email"
              name="email"
              id="email"
              label="Email"
              register={{ ...register("email") }}
              errors={errors}
              classNameLabel="fw-semibold"
            />
          </div>
          <div className="mt-4">
            <Input
              type="password"
              name="password"
              id="password"
              label="Password"
              register={{ ...register("password") }}
              errors={errors}
              classNameLabel="fw-semibold"
            />
          </div>

          <div className="d-grid mt-4 pt-4">
            <BlackButton type="submit" loading={loading} name="Sign Up" />
          </div>
        </form>

        <div className="mt-4 px-4 w-100">
          <span className="signup-text me-1">Already have an account?</span>
          <Link to={"/login"} className="signup-text text-dark fw-semibold ">
            Login
          </Link>
        </div>
      </div>
    </SideImage>
  );
}

export default SignUp;
