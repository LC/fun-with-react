import { useFetch } from "../cache/createCache";

export default function Advice() {
  const result = useFetch("https://api.adviceslip.com/advice")
  return <div>{JSON.stringify(result, null, 2)}</div>
}