export const userCard = (
  username,
  id
) => `<svg version="1.1" viewBox="0 0 500 100" xmlns="http://www.w3.org/2000/svg">
 <rect transform="scale(-1,1)" x="-500" width="500" height="100" fill="#171717"/>
 <path transform="translate(-3.1006)" d="m410.61-178.86c-7.5015 5.3323-7.1147 4.6496-13.175 6.6293-13.896 4.5434-27.223 2.048-43.037 0.72808-4.7558-0.5309-9.4737-0.84196-14.078-0.87223-23.248-0.15928-42.992 6.6596-46.731 25.698-6.8947 4.1793-13.236 9.2385-19.516 14.305-13.41 10.581-23.506 23.514-30.393 39.101-9.4053 23.021-0.91021 47.725 3.2995 71.056 1.0012 5.4612 2.048 10.665 2.6093 12.675 0.79692 2.8292 2.1997 5.5295 3.7243 7.9567 0.35706 0.05997 2.2376-2.8368 2.6851-4.1187 0.65219-1.8659 0.58459-4.862-0.12859-7.4409-1.5777-5.8025-3.0795-10.513-3.2084-12.879-0.22763-4.4448 0.63697-8.5483 2.2603-10.581 0.57601-0.72066 1.8962 2.9961 1.5549 4.3766-0.40178 1.6611-0.70552 4.5055-0.57602 5.8177 0.35608 4.4448 1.0088 9.2006 1.8204 13.357 1.0392 5.3626 1.4866 8.8062 1.297 10.141-0.13606 0.97087-0.59222 1.9493-2.3361 4.953-1.517 2.632-2.3059 4.7634-2.4272 6.6445-0.12859 1.8356 0.42463 6.4245 0.94071 7.5471 0.7512 1.7521 3.0112 3.5953 4.9833 4.0504 1.8886 0.72066 2.8367 2.2148 3.8077 3.8911 2.3589 4.4979 4.1793 9.9743 5.9845 18.227 0.87976 3.9518 1.6157 7.4788 1.8507 9.3296-14.563 0.0143-33.215 0.0227-50.205 0.0227-5.7191 0.0905-16.05-2.5941-25.524-3.216-1.3729-14.821-7.8808-32.039-19.016-33.041-7.6003-0.69019-13.903 2.1997-19.236 14.207l0.15132 0.64468c3.1478-2.632 6.47-10.68 18.439-10.126 9.193 0.41712 12.257 17.817 13.168 28.285-5.5977 0.40951-10.361 2.1314-12.849 6.4321h-0.0572c0 7e-3 0 0.0227 0.0195 0.039-0.0195 0.0143-0.0195 0.0305-0.0195 0.0447h0.0572c2.5637 4.407 7.5016 6.1137 13.304 6.455 3.876 109.6 106.9 123.74 135.06 123.74 105.04 0 141.81-71.375 147.34-99.644 2.5865 12.045-5.5598 27.389-7.5092 38.714 22.156-25.615 18.151-50.243 14.101-75.016 3.3677 4.0049 7.9264 6.4852 14.108 5.1123-4.4069-2.943-10.384-0.87985-13.964-13.297-1.5625-5.3626-2.9127-9.3827-4.2552-12.758-2.8975-10.869-7.0086-21.253-12.06-31.372-4.2627-10.976-1.4487-18.09-1.8735-27.511 7.6685 25.288 12.462 32.016 21.412 34.664-22.512-27.124-14.806-69.122-27.526-106.61 5.7571 3.3829 12.326 4.3993 19.319 0.26546-6.7658-1.9266-13.517 3.1629-23.225-11.104-8.1994-15.952-20.078-27.731-34.489-38.123-7.7216-5.0364-16.293-8.4194-24.909-11.56 8.7758-2.1996 18.576-10.012 19.031-15.845zm-14.722 84.247c11.56 4.2173 24.302 20.237 24.158 35.953v0.87995c-0.31043 21.344-10.012 32.82-9.6026 47.035 0.52368 16.74 7.7291 22.581 9.1627 25.372-2.4575-10.323-3.8987-23.309-0.6522-33.594 4.1718-13.228 8.3815-24.181 8.078-34.542-0.15132-2.4272-1.1833-11.506-1.8735-15.527 12.394 17.885-2.6852 43.894 1.6536 60.915 7.5395 29.65 41.331 33.397 31.273 93.136-8.8517 52.519-69.501 92.378-131.67 92.378-46.087 0-125.95-25.508-129.89-115.99 9.3675-0.66743 19.44-3.2767 25.091-3.1857 17.081 0 36.59 7e-3 51.29 0.0143 2.761 12.455 4.8317 15.458 15.307 23.756 11.651 9.1627 14.366 10.278 31.599 10.445 17.241 0.17437 22.353-3.5194 39.078-19.342 3.6104-4.2324 5.1729-9.7771 6.9251-14.988 17.203-0.15937 29.748-0.46263 42.089-1.0391 12.568-0.56889 14.343 0 34.595-2.0859-20.252-2.0859-22.027-1.517-34.595-2.0934-12.015-0.54604-24.181-0.85719-40.633-1.0088 1.3805-6.1969 3.3526-12.25 5.4536-18.234 1.2971-3.527 2.8217-6.963 4.3842-10.384l1.7066-0.5309c3.2919-1.1681 6.2045-3.6712 7.3651-7.0541 1.4942-4.4827 0.43227-9.5192-2.4576-13.183-0.99354-1.3729-2.23-3.125-2.7382-3.8987-1.5245-2.412-1.5625-3.7546-0.27309-12.72 1.0848-7.5092 1.206-11.438 0.45512-15.246-0.15131-2.1769-0.16658-6.6521-0.23509-7.8581 0.57605 0.31858 1.828 3.1705 3.0946 7.0313 1.2591 3.8759 1.4639 4.6799 1.7521 7.9794 0.31888 3.747-1.0846 6.5231-2.2376 12.113-0.57696 2.8823-1.0846 5.5598-1.0846 5.9239 0 0.38685 0.27341 1.206 0.56078 1.8432 0.67506 1.426 1.9418 3.4284 2.1769 3.4284 4.1338-4.5586 6.561-10.187 8.7228-15.898 2.2755-6.4624 2.943-13.319 4.5358-19.971 1.2895-5.7949 2.7762-11.597 3.2388-17.544 0.93308-11.605 0.38655-19.797-2.1769-31.887-0.61414-2.7306-2.3892-7.9415-3.6257-10.399zm-40.656 57.168c4.4372-0.05332 8.8289 0.48548 13.008 1.6915 5.6812 2.1769 6.4776 7.2513 7.5244 12.948 0.58459 3.6408 0.56079 6.2576-0.099 10.536-0.46275 6.2045-2.9278 11.006-8.3132 14.381-8.1235 1.5018-16.808 2.9506-23.696-2.4272-5.7798-7.9643-9.2613-18.03-7.934-27.845 0.84167-4.0276 2.7155-6.1211 6.5686-7.3726 4.149-1.1908 8.5408-1.8432 12.94-1.9114zm-67.378 0.72066c4.149-0.03809 8.3435 0.40198 10.649 1.8735 9.8985 6.6976 6.7203 17.597 2.8064 27.162-5.6963 12.523-18.014 12.06-29.953 11.962-6.6065-1.9342-7.2133-7.3499-8.169-13.137-0.81884-5.5902-2.5637-11.582-1.1074-17.203 3.7394-9.0413 17.408-10.08 25.774-10.657zm150.96 1.5625c0.0571 24.067 4.1642 35.892 12.417 52.936-4.8621-9.2765-11.81-14.556-14.396-25.645-4.9455-21.412 0.38657-20.214 1.9796-27.291zm-119.94 17.43c1.3046 1.3198 1.9342 3.1402 3.0644 4.5889 0.87215-1.4942 1.7673-2.9809 2.8898-4.3083 0.58365 0.01429 1.2971 1.1681 1.9418 3.2312 2.7609 7.6305 3.2994 16.027 6.8796 23.362 3.3451 5.3095-1.2212 8.4042-6.2348 8.6469-3.656-0.0075-5.2034-2.5031-7.35-4.9758-0.55413 1.6156-1.608 2.6547-2.8671 3.747-3.2009 2.6851-9.4736 1.6915-10.444-2.541 1.2894-8.0856 5.408-15.511 8.1083-23.263 1.3426-2.8292 1.3577-4.9985 4.0125-8.4876zm-46.966 40.845c1.6156 0 6.0528 3.0112 6.9555 4.7103 0.62174 1.1302 2.0403 5.5295 2.139 6.599 0.15911 1.2743-0.22763 4.2931-0.62174 5.1123-0.28867 0.58412-0.50844 0.66743-0.84166 0.28832-0.28089-0.31848-3.9973-7.4485-6.3714-12.166-1.866-3.7773-2.0631-4.5434-1.2592-4.5434zm92.704 2.3589c0.0572 0.0075 0.15132 0.03052 0.2351 0.05332 0.50081 0.2048 0.15132 1.9797-1.7293 8.427-0.35608 1.9418-1.2212 3.4739-2.4879 4.7482-0.41703 0-0.6065-0.48548-1.2592-3.1781-0.55413-2.2983-0.61414-4.3462-0.22763-6.1818 0.66742-2.2983 3.3678-3.0037 5.4689-3.8684zm-11.249 14.055c0.15911-0.03052 0.31043 0.05332 0.50841 0.21233 0.68269 0.47787 0.78075 1.737 0.3266 4.2021-0.55413 3.1705-0.67505 3.5195-1.4942 3.8456-0.35706 0.15937-0.99354 0.27306-1.4184 0.27306-0.76646-0.13655-0.96327-0.75855-0.78075-1.699 0-1.9721 0.57605-3.6863 1.8811-5.7115 0.49322-0.75855 0.7436-1.0847 0.97851-1.1226zm-65.481 0.14404c0.52368 0 2.101 1.1378 2.6852 1.9266 0.65219 0.83434 1.3956 5.8025 0.97837 6.6596-0.47795 1.0771-2.814 0.53851-3.4587-0.80397-0.39417-0.80396-1.3273-5.1426-1.3273-6.1742 0-0.95575 0.46272-1.608 1.1225-1.608zm59.853 1.3122c0.63697 0.91022 0.80361 2.0783 0.66746 4.642l-0.12859 2.3362-0.66742 0.66744c-0.40181 0.3717-1.0847 0.82681-1.4943 1.0164-0.90258 0.42483-1.5929 0.46263-1.7218 0.12141-0.15132-0.45511 0.10586-3.3526 0.38658-4.331 0.32656-1.0088 1.7901-4.0201 2.2756-4.6572 0.21984-0.58412 0.47795 0.14404 0.68266 0.2048zm-38.084-0.13654c1.3729 0.34886 1.9797 1.5853 2.7307 2.7079l0.50841 1.0012-0.71315 2.4803c-0.37891 1.3653-0.78072 2.5941-0.90258 2.7306-0.13606 0.15177-0.6446 0.22756-1.3957 0.22003-2.0024-0.0533-2.23-0.13655-2.7685-0.95576l-0.50081-0.74332 0.42463-2.0859c0.61414-3.0037 0.91025-3.9063 1.5929-4.68 0.35609-0.41712 0.71315-0.64468 1.0239-0.67505zm-12.675 2.1466 1.1302 1.1302 0.18931 2.5562c0.099 1.3956 0.14385 2.6927 0.0666 2.852-0.0666 0.21993-0.47796 0.28059-1.7446 0.28059h-1.646c-0.87976-0.96326-1.1529-2.139-1.5245-3.3526-0.86453-3.6484-0.86453-5.3095 0.0292-5.5295 1.4639 0.09047 2.4272 1.1529 3.4967 2.0631zm43.993-1.7521c1.7901 0.47777 1.4335 3.3222 1.426 5.355-0.13606 3.2919-0.26562 3.9746-0.69029 4.3993-0.736 0.7357-2.7837 0.3261-3.7773-0.76607-0.32657-0.39437-0.35703-0.51586-0.099-2.1162 0.29614-1.9493 0.67506-3.163 1.517-4.8317 0.61414-1.1984 1.1908-1.9493 1.6232-2.0404zm-40.398 0.15177c0.099-0.0075 0.25815 0 0.40941 0.01429 1.1377 0.09047 2.1996 0.83434 3.1401 2.1997l0.75887 1.115c0.0666 1.828 0 3.7546-0.3266 5.4536-0.19711 0.099-1.0164 0.25032-1.8204 0.32619-1.3956 0.12892-1.5245 0.099-2.01-0.32619-0.67506-0.57651-0.86453-1.646-1.0315-5.1957-0.099-2.8975-0.0292-3.5422 0.87975-3.5877zm17.21 0.60678c1.2212 0.25792 1.9949 0.91022 2.3362 1.9797 0.27342 0.91784 0.43987 6.0528 0.17438 6.4093-0.0951 0.15177-0.66746 0.34133-1.3274 0.42483-2.4576 0.31086-4.6269 0.0762-4.8393-0.50823-0.27341-0.66744 1.555-7.2816 2.2301-8.1008 0.28835-0.63716 0.9861-0.14404 1.426-0.2048zm15.913 0.04475c0.5389-0.05332 1.115 0.46263 1.6763 1.5625 0.45512 0.91784 0.52367 1.2364 0.52367 3.2919 0 1.6384-0.099 2.3438-0.27309 2.4955-0.15132 0.12141-0.76646 0.34133-1.4184 0.50823-1.1378 0.29582-1.3881 0.3262-1.7446 0.2048l-1.7066-0.31085 0.12859-1.0164c0.12079-1.3274 0.99363-4.2704 1.608-5.5446 0.36372-0.75855 0.78072-1.1377 1.206-1.1908zm-7.4181 0.02273c0.35609-0.01429 0.52364 0.06855 0.7512 0.31858 0.5389 0.63716 1.2212 2.5182 1.6536 4.5282 0.57696 2.8292 0.57696 2.8216-0.65982 3.1933-0.53891 0.1669-1.6763 0.34133-2.4879 0.38684-2.6775 0.13654-2.8823-0.0227-2.5562-2.3893 0.25815-2.1086 1.297-5.4309 1.7446-5.6736 0.48558-0.25792 1.0467-0.25032 1.5549-0.36409zm-136.48 10.688c0.0195-7e-3 0.0571 0 0.0571 0 0.0666 1.4791 0.0666 2.9733 0.099 4.46-3.7546-0.28832-6.5155-1.1833-6.5155-2.2376 0-1.0391 2.6623-1.9266 6.3638-2.2224zm6.561 0.12891c3.0416 0.37923 5.1426 1.1757 5.1048 2.0935 0 0.92545-2.0328 1.7142-5.0516 2.0859-0.0292-1.388-0.0292-2.7837-0.0572-4.1793zm142.04 4.0428c0.25815-0.0227 0.37132-0.0447 0.76647-7e-3 1.5776 0.15927 1.8052 0.25792 1.8052 0.78892 0 0.69781-1.1984 2.7989-2.0101 3.527-0.37895 0.36409-0.90262 0.66744-1.0846 0.66744-0.91022 0-1.4411-1.919-1.0164-3.6863 0.25815-0.95576 0.72837-1.2515 1.5398-1.2895zm-5.7267 0.62954c0.70551-0.06 1.388 0.12891 2.0707 0.21993-0.19711 1.9949-1.0923 3.6256-2.7534 4.7103-0.4094 0-0.6141-0.78121-0.6141-2.4879 0-2.0328 0.1065-2.4196 1.297-2.4424zm-6.2804 0.7357c1.4639 0 2.7533 0.0685 2.8141 0.15177 0.27341 0.25792-0.51604 2.2148-1.6763 4.2021-0.99364 1.7673-1.1378 1.8962-1.7522 1.9418-2.412-0.27305-2.3437-3.1023-2.7154-5.044 0-1.1529 0.25815-1.2515 3.3298-1.2515zm-22.823 0.22002c1.6763 0.0305 2.3286 0.28059 2.3286 0.92546 0 0.8192-0.62174 2.45-0.97837 2.6548-0.53891 0.29581-0.58463 0.28058-1.646-0.82682-1.6763-1.8811-1.8659-2.23 0.29614-2.7534zm8.0705 0.0838c0.0292 0.0448 0.35612 0.63716 0.68269 1.3046 0.71311 1.3881 0.76643 1.9949 0.25815 2.4575-1.1984 0.68257-1.4487 0.29582-2.5334-0.39437-1.2592-1.1908-2.2528-2.7913-1.9266-3.125 1.1225-0.40198 2.3589-0.25022 3.5194-0.24259zm3.2008 0.0381 2.9961 0.0533c1.1681 0 2.1769 0.06 2.23 0.15177 0.20457 0.18194-0.45512 4.0808-0.81121 4.9606-0.4094 0.98608-1.8431 0.99358-2.5864-0.17444-1.0619-1.6763-1.7598-3.0871-1.7826-4.058z" fill="#f9f9f9" fill-opacity=".34967"/>
 <g fill="#ffffff" font-family="sans-serif" stroke-linecap="round" stroke-linejoin="bevel">
  <text x="13.510414" y="91.449554" font-size="16.923px" stroke-width="5.9963" xml:space="preserve"><tspan x="13.510414" y="91.449554" fill="#ffffff" font-weight="bold" stroke-width="5.9963">${username}</tspan></text>
  <text x="13.915321" y="26.721155" font-size="16.923px" stroke-width="5.9963" xml:space="preserve"><tspan x="13.915321" y="26.721155" fill="#ffffff" font-weight="bold" stroke-width="5.9963">#${id}</tspan></text>
  <text x="369.97586" y="91.449554" font-size="18.284px" stroke-width="6.4786" xml:space="preserve"><tspan x="369.97586" y="91.449554" font-weight="bold" stroke-width="6.4786"><tspan fill="#f87171">F</tspan><tspan fill="#fb923c">r</tspan><tspan fill="#facc15">e</tspan><tspan fill="#a3e635">e</tspan><tspan fill="#4ade80">S</tspan><tspan fill="#2dd4bf">e</tspan><tspan fill="#60a5fa">w</tspan><tspan fill="#818cf8">i</tspan><tspan fill="#a78bfa">n</tspan><tspan fill="#c084fc">g</tspan></tspan></text>
 </g>
</svg>`