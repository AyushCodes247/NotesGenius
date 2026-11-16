import { useDispatch, useSelector } from "react-redux";
import type { appDispatch, RootState } from "../store/store";

export const useAppDispatch = useDispatch.withTypes<appDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
