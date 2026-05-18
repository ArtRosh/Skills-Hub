import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import DataContext from "../../../context/DataContext";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  password: yup.string().required("Password is required"),
});

function Login() {
  const { login } = useContext(DataContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: (values, { setSubmitting }) => {
      setServerError(null);

      login(values)
        .then(() => navigate("/topics", { replace: true }))
        .catch((err) => setServerError(err.message))
        .finally(() => setSubmitting(false));
    },
  });

  const nameError =
    formik.touched.name && formik.errors.name ? formik.errors.name : null;

  const passwordError =
    formik.touched.password && formik.errors.password
      ? formik.errors.password
      : null;

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2 className="mb-3">Login</h2>

      {serverError ? (
        <div className="alert alert-danger">{serverError}</div>
      ) : null}

      <form onSubmit={formik.handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="name">
            UserName
          </label>

          <input
            id="name"
            name="name"
            className={`form-control ${nameError ? "is-invalid" : ""}`}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="username"
          />

          {nameError ? <div className="invalid-feedback">{nameError}</div> : null}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="password">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            className={`form-control ${passwordError ? "is-invalid" : ""}`}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="current-password"
          />

          {passwordError ? (
            <div className="invalid-feedback">{passwordError}</div>
          ) : null}
        </div>

        <button
          className="btn btn-primary w-100"
          type="submit"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default Login;