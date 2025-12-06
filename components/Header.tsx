
import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        // J'utilise style={{...}} pour FORCER le layout même si Tailwind plante
        <header
            className="w-full flex items-center justify-between px-10 pt-2 pb-4"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px 20px 40px' }}
        >

            {/* 1. Le Logo */}
            <div
                className="relative h-[60px] w-[180px]"
                // Style de secours pour la taille
                style={{ height: '60px', width: '180px', position: 'relative' }}
            >
                <Image
                    src="/header_logo.png"
                    alt="Lúmina"
                    fill
                    className="object-contain object-left"
                    priority
                />
            </div>

            {/* 2. Le Menu */}
            <nav>
                {/* 'gap: 40px' force l'espace entre les mots */}
                <ul
                    className="flex items-center gap-10 m-0 p-0 list-none"
                    style={{ display: 'flex', gap: '40px', listStyle: 'none', margin: 0, padding: 0 }}
                >
                    <MenuItem href="#" label="Accueil" />
                    <MenuItem href="#" label="Tarifs" />
                    <MenuItem href="#" label="Assistant IA" />
                    <MenuItem href="#" label="Imprimer" />
                    <MenuItem href="#" label="Blog" />
                </ul>
            </nav>

        </header>
    );
}

function MenuItem({ href, label }: { href: string; label: string }) {
    return (
        <li>
            <Link
                href={href}
                className="
          relative group
          text-[14px] uppercase font-bold tracking-[0.15em]
          text-[#2C1810] /* Brun Lúmina */
          transition-colors duration-300 ease-in-out
          hover:text-[#681829] /* Bordeaux Lúmina */
        "
                // Style de secours (conservé pour la sécurité)
                style={{
                    textDecoration: 'none',
                    color: '#2C1810',
                    textTransform: 'uppercase',
                    fontSize: '14px',
                    letterSpacing: '0.15em',
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    position: 'relative'
                }}
            >
                {label}

                {/* La ligne dorée qui part du centre */}
                <span className="
          absolute
          -bottom-2
          left-1/2
          w-0
          h-[2px]
          bg-[#D4AF37] /* Or Lúmina */
          transition-all duration-300 ease-out
          -translate-x-1/2
          group-hover:w-full
        "></span>
            </Link>
        </li>
    );
}
