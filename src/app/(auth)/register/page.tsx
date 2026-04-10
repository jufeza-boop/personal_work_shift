import { registerAction } from "@/app/actions/auth";
import { RegisterForm } from "@/presentation/components/auth/RegisterForm";

export default function RegisterPage() {
  return <RegisterForm action={registerAction} />;
}
