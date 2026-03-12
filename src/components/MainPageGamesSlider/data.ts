import { TCard } from "./types";
import Taboo from "@/assets/images/main_page/Taboo.png";
import NeverHaveIEver from "@/assets/images/main_page/Never have I ever.png";
import WouldYouRather from "@/assets/images/main_page/Would you rather.png";
import WhatHappensNext from "@/assets/images/main_page/What happens next.png";
import Films from "@/assets/images/main_page/films & series.png";
import IfYouCould from "@/assets/images/main_page/If I could.png";
import NameThree from "@/assets/images/main_page/Name three.png";
import DiscussionCards from "@/assets/images/main_page/Discussion cards.png";
import Contr from "@/assets/images/main_page/Controversials.png";
import FirstMeeting from "@/assets/images/main_page/Fisrt meeting.png";

export const speakingGames: TCard[] = [
  {
    title: "Taboo game",
    subTitle: "90 cards, A2 -- B2 + slang",
    description: "",
    descriptionKey: "games.taboo.description",
    link: "/speaking_games/taboo",
    videoSrc: "",
    imageSrc: Taboo,
  },
  {
    title: "Never have I ever",
    subTitle: "130+ cards, A2 -- B2",
    description: "",
    descriptionKey: "games.neverHaveIEver.description",
    link: "/speaking_games/never_have_i_ever",
    videoSrc: "",
    imageSrc: NeverHaveIEver,
  },
  {
    title: "Would you rather",
    subTitle: "50+ cards, A2+",
    description: "",
    descriptionKey: "games.wouldYouRather.description",
    link: "/speaking_games/would_you_rather",
    videoSrc: "",
    imageSrc: WouldYouRather,
  },
  {
    title: "What happens next",
    subTitle: "30 short videos, A2 -- B2",
    description: "",
    descriptionKey: "games.whatHappensNext.description",
    link: "/speaking_games/what_happens_next",
    videoSrc: "",
    imageSrc: WhatHappensNext,
  },
  {
    title: "What happens next",
    subTitle: "Films & series",
    description: "",
    descriptionKey: "games.whatHappensNextFilms.description",
    link: "/speaking_games/what_happens_next_films",
    videoSrc: "",
    imageSrc: Films,
  },
  {
    title: "If you could",
    subTitle: "30 cards, A2+",
    description: "",
    descriptionKey: "games.ifYouCould.description",
    link: "/speaking_games/if_you_could",
    videoSrc: "",
    imageSrc: IfYouCould,
  },
  {
    title: "Name three",
    subTitle: "90 cards, A2+",
    description: "",
    descriptionKey: "games.nameThree.description",
    link: "/speaking_games/name_three",
    videoSrc: "",
    imageSrc: NameThree,
  },
];

export const discussionCards: TCard[] = [
  {
    title: "Discussion cards",
    subTitle: "140+ cards, A2+",
    description: "",
    descriptionKey: "games.discussionCards.description",
    link: "/cards/discussion_cards",
    videoSrc: "",
    imageSrc: DiscussionCards,
  },
  {
    title: "Controversial statements",
    subTitle: "30 cards, A2+",
    description: "",
    descriptionKey: "games.controversial.description",
    link: "/cards/controversial_statements",
    videoSrc: "",
    imageSrc: Contr,
  },
  {
    title: "First meeting",
    subTitle: "30 cards, A2+",
    description: "",
    descriptionKey: "games.firstMeeting.description",
    link: "/cards/first_meeting",
    videoSrc: "",
    imageSrc: FirstMeeting,
  },
];
