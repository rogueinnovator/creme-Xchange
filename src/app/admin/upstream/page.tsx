import { redirect } from "next/navigation";

const page = () => {
  return redirect("/admin/upstream/batches-information");
};

export default page;
