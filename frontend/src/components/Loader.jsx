const Loader = () => {
  return (
    <div style={styles.overlay}>
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  }
};

export default Loader;