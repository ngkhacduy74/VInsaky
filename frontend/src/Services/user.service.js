import axios from "axios";

const getUserByEmail = (email) => {
  const URL_BACKEND = `${process.env.REACT_APP_BACKEND_URL}/user/email`;
  return axios.get(URL_BACKEND, { params: { email } });

};

export default getUserByEmail;
