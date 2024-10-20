import companyLogo from '@/assets/images/login/logo.png';
import { MacScrollbar } from 'mac-scrollbar';
import { login } from '@/api/userAuth';
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import useErrorModal from '@/hooks/useErrorModal';
import useUserAuth from '@/hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { rememberedEmailAtom } from '@/atoms/userAuthAtoms';
import { useEffect } from 'react';
import useModal from '@/hooks/useModal';
import { ValidationErrors } from '@/constants/errorMessages';
interface LoginForm {
  email: string;
  password: string;
  isRemembered: boolean;
}

const Login = () => {
  const { register, handleSubmit, reset } = useForm<LoginForm>();

  const { showErrorModal } = useErrorModal();
  const userAuth = useUserAuth();
  const navigate = useNavigate();
  const { alertModal } = useModal();

  const [rememberedEmail, setRememberedEmail] = useAtom(rememberedEmailAtom);

  const onInvalid: SubmitErrorHandler<LoginForm> = (err) => {
    const firstError = Object.values(err)[0]?.message as string;
    alertModal(firstError);
  };

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      if (data.isRemembered) {
        setRememberedEmail(data.email);
      } else {
        setRememberedEmail(null);
      }
      const encodedPassword = window.btoa(data.password);
      const {
        data: { username, access_token, email, grade },
      } = await login(data.email, encodedPassword);

      userAuth.login(
        {
          username,
          email,
          grade,
        },
        access_token,
      );
      navigate('/');
    } catch (err) {
      showErrorModal(err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('selectedFolder') !== null) {
      localStorage.removeItem('selectedFolder');
    }
  }, []);

  useEffect(() => {
    reset({ isRemembered: !!rememberedEmail, email: rememberedEmail || '' });
  }, [rememberedEmail, reset]);

  return (
    <div className="signup">
      <div className="bg">
        <img src={companyLogo} alt="InspireAI" />
      </div>
      <div className="cont">
        <MacScrollbar>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="signup_cont">
            <div className="signup_box">
              <h1 className="title">Sign in</h1>
              <p>Welcome to InspireAI. Please sign in to your account.</p>
              <div className="signup_form">
                <div className="form_group">
                  <label htmlFor="ID">ID</label>
                  <div>
                    <input
                      type="text"
                      id="ID"
                      placeholder="Enter your ID"
                      {...register('email', { required: ValidationErrors.REQUIRED_ID })}
                    />
                  </div>
                </div>

                <div className="form_group">
                  <label htmlFor="password">Password</label>
                  <div>
                    <input
                      type="password"
                      id="password"
                      placeholder="Enter your password"
                      {...register('password', { required: ValidationErrors.REQUIRED_PASSWORD })}
                    />
                  </div>
                </div>
                <div className="remember">
                  <input type="checkbox" id="remember" {...register('isRemembered')} />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <div className="btn_box">
                  <button type="submit">Sign in</button>
                </div>
              </div>
            </div>
          </form>
        </MacScrollbar>
      </div>
    </div>
  );
};

export default Login;
