import Image from "next/image";

interface StarDecorationProps {
    className?: string;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    opacity?: number;
}

export default function StarDecoration({ className = "", position = "top-right", opacity = 0.5 }: StarDecorationProps) {
    const positionClasses = {
        "top-left": "-top-12 -left-12 rotate-180",
        "top-right": "-top-12 -right-12",
        "bottom-left": "-bottom-12 -left-12 -scale-y-100",
        "bottom-right": "-bottom-12 -right-12 scale-y-100 rotate-180",
    };

    return (
        <div
            className={`absolute h-64 w-64 pointer-events-none select-none z-0 ${positionClasses[position]} ${className}`}
            style={{ opacity }}
            aria-hidden="true"
        >
            <Image
                src="/decor-stars.png"
                alt=""
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}
