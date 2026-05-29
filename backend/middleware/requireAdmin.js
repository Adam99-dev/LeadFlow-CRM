export const requireAdmin = (req, res, next) => {
  if (req.membership?.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};
