import dotenv from "dotenv";
dotenv.config();
export function forgotPasswordVerification(id: string): string {
    const link = `http://localhost:3000/forgetpassword/${id}`;
    let temp = `
       <div style="max-width: 700px;
       margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
       <h2 style="text-align: center; text-transform: uppercase;color: teal;">Change your password.</h2>
        <p style="text-align: center;">  Hi there, Follow the link by clicking on the button to change your password.
        </p>
         <a href=${link}
         style="background: crimson; justify-content: center; align-items: center; text-decoration: none; color: white;
          padding: 10px 20px; margin: 10px 100px;
         display: inline-block;">Click here</a>
        </div>
        `;
    return temp;
  }