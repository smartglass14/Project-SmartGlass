import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeClosed, LoaderCircle} from 'lucide-react';
import { registerUser, loginWithGoogle } from '../../firebase/firebase.js';
import { useAuth } from './../../context/AuthContext.jsx';
import {API, handleApi} from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function Signup() {

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const newErrors = { ...errors };
    if (!value) {
      newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else {
      delete newErrors[name];
    }
    setErrors(newErrors);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);

    const hasErrors = Object.values(formData).some((v) => v.trim() === '');
    if (hasErrors) {
      const newErrors = {};
      Object.entries(formData).forEach(([key, val]) => {
        if (!val) newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
      });
      setErrors(newErrors);
      return;
    }

    const { name, email, password } = formData;
    try{
      let firebaseRes = await registerUser(email, password);
      
      let res = await handleApi(API.post('/auth', {name, firebaseToken: firebaseRes.accessToken}));
      
      if(res.status === 200){
        const { token, user } = res.data;
        auth.loginContext(user, token);   
        toast.success(res.data.message);
        setLoading(false);
        setFormData({ name: '', email: '', password: '' });
        navigate('/');
      }
      
    }catch (err) {
        let msg = err.message;
        const match = msg.match(/\(auth\/([^)]+)\)/);
        if (match && match[1]) {
          msg = match[1].replace(/-/g, " ");
        }
        toast.error(msg.charAt(0).toUpperCase() + msg.slice(1));
        setLoading(false);
      }

  };

  const googleLoginHandler = async (e)=> {
    e.preventDefault();
    setLoading(true);
        try{
          let firebaseRes = await loginWithGoogle();

          let res = await handleApi(API.post('/auth', {name, firebaseToken: firebaseRes.accessToken}));
      
          if(res.status === 200){
            const { token, user } = res.data;
            auth.loginContext(user, token);   
            toast.success(res.data.message);
            setLoading(false);
            setFormData({ name: '', email: '', password: '' });
            navigate('/');
            setLoading(false);
          }
        } catch(err){

          let msg = err.message;
          const match = msg.match(/\(auth\/([^)]+)\)/);
          if (match && match[1]) {
            msg = match[1].replace(/-/g, " ");
          }

          toast.error(msg.charAt(0).toUpperCase() + msg.slice(1));
          setLoading(false);
        }     
  }

  return (
    <div className="h-fit bg-gradient-to-br from-indigo-100 to-white flex flex-col justify-center items-center p-6">
      <h1 className="text-4xl font-bold text-indigo-700 mb-4 text-center">
        Join SmartGlass
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Empowering Indian classrooms with interactive discussions and smart presentations.
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 w-full max-w-md animate-fade-in"
      >
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Full Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-300"
            type="text"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-300"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>

          <div className='relative flex justify-center items-center w-full'>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-300"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            
            <span className='absolute right-3'>
              {
                !showPassword ? (
                  <Eye className='hover:cursor-pointer' onClick={() => setShowPassword(true)} />
                ) : (
                  <EyeClosed className="hover:cursor-pointer" onClick={() => setShowPassword(false)} />
                )
              }
            </span>
          </div>

          {errors.password && (
            <p className="text-red-600 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-indigo-300 transition duration-300"
        >
          {loading ? (
            <LoaderCircle className="animate-spin text-white" />
          ) : (
            'Sign Up'
          )}
        </button>

        <div className="flex items-center my-4">
              <hr className="flex-grow" />
              <span className="px-3 text-sm"> OR </span>
              <hr className="flex-grow" />
          </div>

        <div>
          <button className="w-full bg-white border border-gray-300 hover:bg-gray-600 hover:text-white hover:cursor-pointer text-gray-700 font-semibold py-2.5 px-4 rounded transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
            onClick={googleLoginHandler}
          >
            <span><i className="fa-brands fa-google"></i></span>
            Continue with Google
          </button> 
        </div>

        <p className="text-center text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 underline hover:text-indigo-800">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}