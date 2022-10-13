interface IProps {
    title: string;
    url: string;
}

function Card(props: IProps, childern: any) {
    return (
        <div className="flex flex-col items-center w-full p-2 m-2 align-middle shadow-lg sm:w-80 rounded-xl hover:cursor-pointer">
            <h1 className="w-full text-4xl truncate">{props.title}</h1>
            <img className="object-cover aspect-video" alt="tumbnail" src={props.url} />
            {childern}
        </div>
    )
}

export default Card;