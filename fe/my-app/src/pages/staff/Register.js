import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/inputField/InputField";
import PasswordInput from "../../components/passwordInput/PasswordInput";
import Button from "../../components/button/Button";
import api from "../../utils/api";
import { USER_ROLES } from "../../utils/constants";
import { useToast } from "../../context/ToastContext";
import "./Register.css";

const RoleSelect = ({ value, onChange }) => (
  <div className="form-group">
    <label>Account Type:</label>
    <select
      name="role"
      value={value}
      onChange={onChange}
      className="form-select"
    >
      <option value={USER_ROLES.STUDENT}>Student</option>
      <option value={USER_ROLES.TUTOR}>Tutor</option>
      <option value={USER_ROLES.ADMIN}>Admin</option>
    </select>
  </div>
);

const AvatarUpload = ({ onFileChange, preview }) => (
  <div className="avatar-upload">
    <label>Avatar (optional):</label>
    <input
      type="file"
      accept="image/*"
      onChange={onFileChange}
      className="avatar-input"
    />
    {preview && (
      <div className="avatar-preview">
        <img src={preview} alt="Avatar Preview" />
      </div>
    )}
  </div>
);

const StudentFields = ({ studentId, major, onChange }) => (
  <>
    <InputField
      label="Student ID"
      name="student_ID"
      type="text"
      placeholder="Enter student ID..."
      value={studentId}
      onChange={onChange}
      required
    />

    <div className="form-group">
      <label htmlFor="major">Major*</label>
      <select
        id="major"
        name="major"
        value={major}
        onChange={onChange}
        required
        className="form-select"
      >
        <option value="IT">IT</option>
        <option value="Business">Business</option>
        <option value="Design">Design</option>
      </select>
    </div>
  </>
);

const TutorFields = ({ tutorId, major, onChange }) => (
  <>
    <InputField
      label="Tutor ID"
      name="tutor_ID"
      type="text"
      placeholder="Enter tutor ID..."
      value={tutorId}
      onChange={onChange}
      required
    />

    <div className="form-group">
      <label htmlFor="major">Major*</label>
      <select
        id="major"
        name="major"
        value={major}
        onChange={onChange}
        required
        className="form-select"
      >
        <option value="IT">IT</option>
        <option value="Business">Business</option>
        <option value="Design">Design</option>
      </select>
    </div>
  </>
);

const useFormValidation = (formData, toast) => {
  const validate = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      student_ID,
      tutor_ID,
      major,
    } = formData;

    const displayError = (message) => {
      toast.error(message);
      return false;
    };

    if (!firstName || !lastName || !email || !password || !role) {
      return displayError("Please fill in all required fields.");
    }

    if (role === USER_ROLES.STUDENT && (!student_ID || !major)) {
      return displayError(
        "Student ID and Major are required for student accounts."
      );
    } else if (role === USER_ROLES.TUTOR && (!tutor_ID || !major)) {
      return displayError(
        "Tutor ID and Major are required for tutor accounts."
      );
    }

    if (!email.includes("@")) {
      return displayError("Invalid email address.");
    }

    if (password.length < 6) {
      return displayError("Password must be at least 6 characters.");
    }

    return true;
  };

  return { validate };
};

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: USER_ROLES.STUDENT,
    student_ID: "",
    major: "IT",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { validate } = useFormValidation(formData, toast);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: USER_ROLES.STUDENT,
      student_ID: "",
      major: "IT",
    });
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return; // Prevent multiple submissions
    }

    try {
      if (!validate()) {
        return;
      }

      setLoading(true);

      const {
        firstName,
        lastName,
        email,
        password,
        role,
        student_ID,
        tutor_ID,
        major,
      } = formData;

      const formDataToSend = new FormData();
      formDataToSend.append("firstName", firstName);
      formDataToSend.append("lastName", lastName);
      formDataToSend.append("email", email);
      formDataToSend.append("password", password);
      formDataToSend.append("role", role);

      if (role === USER_ROLES.STUDENT) {
        formDataToSend.append("student_ID", student_ID);
        formDataToSend.append("major", major);
      } else if (role === USER_ROLES.TUTOR) {
        formDataToSend.append("tutor_ID", tutor_ID);
        formDataToSend.append("major", major);
      }
      if (avatar) {
        formDataToSend.append("avatar", avatar);
      }
      await api.post("/api/admin/create-account", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const successMessage = `Successfully created ${role} account for ${email}`;
      toast.success(successMessage);
      resetForm();
    } catch (err) {
      console.error("Error creating account:", err);

      let errorMessage = "Failed to create account. Please try again.";

      if (err.response) {
        if (err.response.status === 400) {
          // Handle validation errors
          errorMessage = err.response.data?.message || "Please check your input data.";

          // Xử lý đặc biệt khi student_ID đã tồn tại
          if (
            err.response.data?.message?.includes("student_ID") ||
            err.response.data?.message?.includes("Student ID")
          ) {
            errorMessage = "A student with this Student ID already exists.";
          }
        } else if (
          err.response.data?.message?.includes("tutor_ID") ||
          err.response.data?.message?.includes("tutor_ID")
        ) {
          errorMessage = "A tutor with this Tutor ID already exists.";
        } else if (err.response.status === 401) {
          // Handle authentication errors
          errorMessage = "You are not authorized to create accounts.";
        } else if (err.response.status === 409) {
          // Handle conflict errors (e.g., email already exists)
          errorMessage =
            err.response.data?.message ||
            "A user with this email already exists.";
        } else if (err.response.status === 500) {
          // Handle server errors
          errorMessage = "Server error occurred. Please try again later.";
        } else if (err.response.data?.message) {
          // Get message from response if available
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          // Get error from response if available
          errorMessage = err.response.data.error;
        }
      } else if (err.request) {
        // Handle network errors
        errorMessage = "No response from server. Please check your connection.";
      } else if (err.message) {
        // Handle other errors
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h2 className="register-title">Create New Account</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <RoleSelect value={formData.role} onChange={handleChange} />

        <AvatarUpload
          onFileChange={handleAvatarChange}
          preview={avatarPreview}
        />

        {formData.role === USER_ROLES.STUDENT && (
          <StudentFields
            studentId={formData.student_ID}
            major={formData.major}
            onChange={handleChange}
          />
        )}
        {formData.role === USER_ROLES.TUTOR && (
          <TutorFields
            studentId={formData.tutor_ID}
            major={formData.major}
            onChange={handleChange}
          />
        )}
        <InputField
          label="First Name"
          name="firstName"
          type="text"
          placeholder="Enter first name..."
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <InputField
          label="Last Name"
          name="lastName"
          type="text"
          placeholder="Enter last name..."
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="Enter email address..."
          value={formData.email}
          onChange={handleChange}
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Enter password..."
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Button type="submit" disabled={loading} className="register-button">
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
};

export default Register;
