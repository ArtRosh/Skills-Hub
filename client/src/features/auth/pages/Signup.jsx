import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import DataContext from "../../../context/DataContext";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  password: yup.string().required("Password is required"),
  role: yup.string().oneOf(["student", "tutor"]).required("Role is required"),
});

function Signup() {
  const { signup } = useContext(DataContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
      role: "student",
    },
    validationSchema: schema,
    onSubmit: (values, { setSubmitting }) => {
      setServerError(null);

      signup(values)
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

  const roleError =
    formik.touched.role && formik.errors.role ? formik.errors.role : null;

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2 className="mb-3">Sign up</h2>

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
            autoComplete="new-password"
          />

          {passwordError ? (
            <div className="invalid-feedback">{passwordError}</div>
          ) : null}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="role">
            Role
          </label>

          <select
            id="role"
            name="role"
            className={`form-select ${roleError ? "is-invalid" : ""}`}
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="student">student</option>
            <option value="tutor">tutor</option>
          </select>

          {roleError ? <div className="invalid-feedback">{roleError}</div> : null}
        </div>

        <button
          className="btn btn-success w-100"
          type="submit"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}

export default Signup;