const NotificationButton = () => {
    const handleSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: "YOUR_PUBLIC_VAPID_KEY",
        });
  
        await fetch("http://localhost:3000/api/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: { "Content-Type": "application/json" },
        });
  
        alert("Push notifications enabled!");
      } catch (error) {
        console.error("Error subscribing to push notifications", error);
      }
    };
  
    return <button onClick={handleSubscribe}>Enable Notifications</button>;
  };
  
  export default NotificationButton;
  