import { useParams } from "react-router-dom";

function Challenge() {
    const {id} = useParams();
  return (
    <div>Challenge - {id}</div>
  )
}

export default Challenge