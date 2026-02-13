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

            <div className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card p-6 text-left shadow-sm">
                    <p className="text-base leading-relaxed text-foreground">
                        Share your media with the world. Uses ICP ID2 for login, no personal
                        information needed. Ever.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 text-left shadow-sm">
                    <p className="text-base leading-relaxed text-foreground">
                        Easy to Use. Easy to Share. Blockchain encryptied and owned only by you.
                        You decide who sees it.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 text-left shadow-sm">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-background">
                            <img
                                src="/assets/GeekGoat-e8cRlk9m.png"
                                alt="GeekGoat"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                    <p className="text-base leading-relaxed text-foreground">
                        Built, designed and deployed by GeekDice - A Non-Dev. Try it yourself at
                        caffeine.ai.
                    </p>
                </div>
            </div>
        </div>
    );
}
