type GoalParams = Record<string, string | number | boolean>;

const trackGoal = (goalName: string, params?: GoalParams) => {
  if (typeof window === "undefined") return;
  const datafast = (window as Window & { datafast?: (...args: any[]) => void })
    .datafast;
  if (typeof datafast !== "function") return;
  if (params && Object.keys(params).length) datafast(goalName, params);
  else datafast(goalName);
};

const datafastService = { trackGoal };

export default datafastService;
