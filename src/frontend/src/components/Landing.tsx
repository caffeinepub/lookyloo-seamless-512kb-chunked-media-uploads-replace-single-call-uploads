export default function Landing() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-8 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                <video
                    src="/assets/LookyLoo-gif.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                />
            </div>
            <h1 className="landing-title mb-2 text-5xl font-bold tracking-tight">LookyLoo</h1>
            <p className="mb-12 text-xl text-muted-foreground">A Li'l Media Share on ICP</p>

            {/* Two-row layout: GeekGoat card centered on first row, other two cards on second row */}
            <div className="flex w-full max-w-5xl flex-col items-center gap-8">
                {/* First row: GeekGoat card (Card C) - centered */}
                <div className="flex w-full justify-center">
                    <div className="hero-card-orange-shadow w-full max-w-md rounded-[3rem] border border-border bg-card px-8 py-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)]">
                        <div className="mb-5 flex justify-center">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-background ring-2 ring-border">
                                <img
                                    src="/assets/GeekGoat-e8cRlk9m.png"
                                    alt="GeekGoat"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        <p className="text-lg font-semibold leading-relaxed tracking-wide text-foreground">
                            Built, designed and deployed by GeekDice - A Non-Dev. Try it yourself at
                            caffeine.ai.
                        </p>
                    </div>
                </div>

                {/* Second row: Cards A and B side-by-side */}
                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="hero-card-orange-shadow rounded-[3rem] border border-border bg-card px-8 py-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)]">
                        <p className="text-lg font-semibold leading-relaxed tracking-wide text-foreground">
                            Share your media with the world. Uses ICP ID2 for login, no personal
                            information needed. Ever.
                        </p>
                    </div>

                    <div className="hero-card-orange-shadow rounded-[3rem] border border-border bg-card px-8 py-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.5)]">
                        <p className="text-lg font-semibold leading-relaxed tracking-wide text-foreground">
                            Easy to Use. Easy to Share. Blockchain encryptied and owned only by you.
                            You decide who sees it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
