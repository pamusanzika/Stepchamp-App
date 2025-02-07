import AppRoutes from "./routes/AppRoutes";
import { useEffect, useState } from "react";
import ContractService from "./lib/contractService";
import "./assets/global.scss";
import LoadingScreen from "./components/features/LoadingScreen/LoadingScreen";
import { useSelector } from "react-redux";
import type { RootState } from './redux/store'

function App() {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const showLoadPopup = useSelector((state: RootState) => state.screenLaoder.value)

  useEffect(() => {
    ContractService.getInstance()
      .init()
      .then((isConnected: boolean) => {
        localStorage.setItem("sc-con-status", isConnected.toString());
        setIsInitialized(true);
      });
  }, []); 

  // Render the AppRoutes component only after initialization is complete
  return(
    <>
      {showLoadPopup && <LoadingScreen showLoadPopup={showLoadPopup} />}
      {isInitialized && <AppRoutes />}
    </>
  );
}
export default App;
