import {
  CloseRounded,
  EmailRounded,
  Visibility,
  VisibilityOff,
  PasswordRounded,
} from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { IconButton, Modal } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { loginFailure, loginStart, loginSuccess } from "../redux/userSlice";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";
import validator from "validator";
import { signIn, googleSignIn, resetPassword } from "../api/index";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { closeSignin } from "../redux/setSigninSlice";

const Container = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #000000a7;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const Wrapper = styled.div`
    width: 380px;
    border-radius: 16px;
    background-color: ${({ theme }) => theme.card};
    color: ${({ theme }) => theme.text_primary};
    padding: 10px;
    display: flex;
    flex-direction: column;
    position: relative;
  `;
  
  const Title = styled.div`
    font-size: 22px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
    margin: 16px 28px;
  `;
  const OutlinedBox = styled.div`
    height: 44px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.text_secondary};
    color: ${({ theme }) => theme.text_secondary};
    ${({ googleButton, theme }) =>
      googleButton &&
      `
      user-select: none; 
    gap: 16px;`}
    ${({ button, theme }) =>
      button &&
      `
      user-select: none; 
    border: none;
      background: ${theme.button};
      color:'${theme.bg}';`}
      ${({ activeButton, theme }) =>
      activeButton &&
      `
      user-select: none; 
    border: none;
      background: ${theme.primary};
      color: white;`}
    margin: 3px 20px;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    padding: 0px 14px;
  `;
  const GoogleIcon = styled.img`
    width: 22px;
  `;
  const Divider = styled.div`
    display: flex;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 14px;
    font-weight: 600;
  `;
  const Line = styled.div`
    width: 80px;
    height: 1px;
    border-radius: 10px;
    margin: 0px 10px;
    background-color: ${({ theme }) => theme.text_secondary};
  `;
  
  const TextInput = styled.input`
    width: 100%;
    border: none;
    font-size: 14px;
    border-radius: 3px;
    background-color: transparent;
    outline: none;
    color: ${({ theme }) => theme.text_secondary};
  `;
  
  const LoginText = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_secondary};
    margin: 20px 20px 30px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  const Span = styled.span`
    color: ${({ theme }) => theme.primary};
  `;
  
  const Error = styled.div`
    color: red;
    font-size: 10px;
    margin: 2px 26px 8px 26px;
    display: block;
    ${({ error, theme }) =>
      error === "" &&
      `    display: none;
      `}
  `;
  
  const ForgetPassword = styled.div`
    color: ${({ theme }) => theme.text_secondary};
    font-size: 13px;
    margin: 8px 26px;
    display: block;
    cursor: pointer;
    text-align: right;
    &:hover {
      color: ${({ theme }) => theme.primary};
    }
    `;

const SignIn = ({ setSignInOpen, setSignUpOpen }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [values, setValues] = useState({
    password: "",
    showPassword: false,
  });

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [resetDisabled, setResetDisabled] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (email !== "") validateEmail();
    if (validator.isEmail(email) && password.length > 5) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!disabled) {
      dispatch(loginStart());
      setDisabled(true);
      setLoading(true);
      try {
        signIn({ email, password }).then((res) => {
          if (res.status === 200) {
            dispatch(loginSuccess(res.data));
            setLoading(false);
            setDisabled(false);
            dispatch(closeSignin());
            dispatch(
              openSnackbar({
                message: "Logged In Successfully",
                severity: "success",
              })
            );
          } else if (res.status === 203) {
            dispatch(loginFailure());
            setLoading(false);
            setDisabled(false);
            setCredentialError(res.data.message);
            dispatch(
              openSnackbar({
                message: "Account Not Verified",
                severity: "error",
              })
            );
          } else {
            dispatch(loginFailure());
            setLoading(false);
            setDisabled(false);
            setCredentialError(`Invalid Credentials : ${res.data.message}`);
          }
        });
      } catch (err) {
        dispatch(loginFailure());
        setLoading(false);
        setDisabled(false);
        dispatch(
          openSnackbar({
            message: err.message,
            severity: "error",
          })
        );
      }
    }
    if (email === "" || password === "") {
      dispatch(
        openSnackbar({
          message: "Please fill all the fields",
          severity: "error",
        })
      );
    }
  };

  const [emailError, setEmailError] = useState("");
  const [credentialError, setCredentialError] = useState("");

  const validateEmail = () => {
    if (validator.isEmail(email)) {
      setEmailError("");
    } else {
      setEmailError("Enter a valid Email Id!");
    }
  };

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters long!");
    } else if (newPassword.length > 16) {
      setResetError("Password must be less than 16 characters long!");
    } else if (
      !newPassword.match(/[a-z]/g) ||
      !newPassword.match(/[A-Z]/g) ||
      !newPassword.match(/[0-9]/g) ||
      !newPassword.match(/[^a-zA-Z\d]/g)
    ) {
      setResetError(
        "Password must contain at least one lowercase, uppercase, number, and special character!"
      );
    } else {
      setResetError("");
      if (newPassword === confirmedPassword) {
        setResetDisabled(false);
      } else {
        setResetError("Passwords do not match!");
      }
    }
  };

  useEffect(() => {
    if (newPassword !== "" || confirmedPassword !== "") {
      validatePassword();
    }
  }, [newPassword, confirmedPassword]);

  const handleResetPassword = async () => {
    if (!resetDisabled) {
      setResettingPassword(true);
      await resetPassword(email, confirmedPassword)
        .then((res) => {
          if (res.status === 200) {
            dispatch(
              openSnackbar({
                message: "Password Reset Successfully",
                severity: "success",
              })
            );
            setShowForgotPassword(false);
            setEmail("");
            setNewPassword("");
            setConfirmedPassword("");
            setResettingPassword(false);
          }
        })
        .catch((err) => {
          dispatch(
            openSnackbar({
              message: err.message,
              severity: "error",
            })
          );
          setResettingPassword(false);
        });
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const user = await axios
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        })
        .catch((err) => {
          dispatch(
            openSnackbar({
              message: err.message,
              severity: "error",
            })
          );
        });
      if (user) {
        googleSignIn({
          name: user.data.name,
          email: user.data.email,
          profilePic: user.data.picture,
        }).then((res) => {
          if (res.status === 200) {
            dispatch(loginSuccess(res.data));
            setLoading(false);
            dispatch(closeSignin());
            dispatch(
              openSnackbar({
                message: "Logged In Successfully",
                severity: "success",
              })
            );
          } else {
            dispatch(loginFailure());
            dispatch(
              openSnackbar({
                message: res.data.message,
                severity: "error",
              })
            );
          }
        });
      }
    },
  });

  return (
    <Modal open={true} onClose={() => setSignInOpen(false)}>
      <Container>
        <Wrapper>
          <IconButton
            sx={{ position: "absolute", top: 10, right: 10 }}
            onClick={() => setSignInOpen(false)}
          >
            <CloseRounded />
          </IconButton>
          <Title>Sign In</Title>
          <OutlinedBox googleButton onClick={googleLogin}>
            
            Sign in with Google
          </OutlinedBox>
          <Divider>
            <Line />
            OR
            <Line />
          </Divider>
          <OutlinedBox>
            <EmailRounded sx={{ mr: 1, color: "action.active" }} />
            <TextInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyUp={validateEmail}
            />
          </OutlinedBox>
          <Error error={emailError}>{emailError}</Error>
          <OutlinedBox>
            <PasswordRounded sx={{ mr: 1, color: "action.active" }} />
            <TextInput
              type={values.showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <IconButton
              sx={{ color: "action.active" }}
              onClick={() =>
                setValues({
                  ...values,
                  showPassword: !values.showPassword,
                })
              }
            >
              {values.showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </OutlinedBox>
          <Error error={credentialError}>{credentialError}</Error>
          <ForgetPassword onClick={() => setShowForgotPassword(true)}>
            Forgot Password?
          </ForgetPassword>
          <OutlinedBox
            button
            activeButton={!disabled}
            disabled={disabled}
            onClick={handleLogin}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            {Loading ? <CircularProgress size={22} /> : "Sign In"}
          </OutlinedBox>
          <LoginText>
            Don't have an account?{" "}
            <Span
              onClick={() => {
                setSignInOpen(false);
                setSignUpOpen(true);
              }}
            >
              Sign Up
            </Span>
          </LoginText>
        </Wrapper>
        <Modal
          open={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        >
          <Container>
            <Wrapper>
              <IconButton
                sx={{ position: "absolute", top: 10, right: 10 }}
                onClick={() => setShowForgotPassword(false)}
              >
                <CloseRounded />
              </IconButton>
              <Title>Reset Password</Title>
              <OutlinedBox>
                <EmailRounded sx={{ mr: 1, color: "action.active" }} />
                <TextInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyUp={validateEmail}
                />
              </OutlinedBox>
              <Error error={emailError}>{emailError}</Error>
              <OutlinedBox>
                <PasswordRounded sx={{ mr: 1, color: "action.active" }} />
                <TextInput
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </OutlinedBox>
              <OutlinedBox>
                <PasswordRounded sx={{ mr: 1, color: "action.active" }} />
                <TextInput
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmedPassword}
                  onChange={(e) => setConfirmedPassword(e.target.value)}
                />
              </OutlinedBox>
              <Error error={resetError}>{resetError}</Error>
              <OutlinedBox
                button
                activeButton={!resetDisabled}
                disabled={resetDisabled}
                onClick={handleResetPassword}
                style={{ cursor: resetDisabled ? "not-allowed" : "pointer" }}
              >
                {resettingPassword ? (
                  <CircularProgress size={22} />
                ) : (
                  "Reset Password"
                )}
              </OutlinedBox>
            </Wrapper>
          </Container>
        </Modal>
      </Container>
    </Modal>
  );
};

export default SignIn;
