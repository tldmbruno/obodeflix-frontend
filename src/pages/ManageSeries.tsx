import {
    Box,
    SelectChangeEvent,
    Typography
} from "@mui/material";
import {
    ChangeEvent,
    useState,
    useEffect
} from "react";

import { NotFound } from "../pages";
import { PaginatedContent } from "../layouts";
import {
    AdminPanelAddContentFAB,
    AdminPanelDeleteSeriesCard,
    AdminPanelSeriesTable,
    ErrorCard,
    ErrorCardStatusCodeProp,
    SuccessCard
} from "../components";
import {
    OrderBy,
    Pagination,
    PaginationBuilder,
    Series,
    SeriesOrderColumn
} from "../types";
import { API_URL } from "../settings";

export const ManageSeries = () => {
    const hasPermissionToAccess = localStorage.getItem("token") && localStorage.getItem("type") === "ADMIN";
    if (!hasPermissionToAccess)
        return <NotFound />;

    const [isRequestLoading, setIsRequestLoading] = useState(false);
    const [statusCode, setStatusCode] = useState<ErrorCardStatusCodeProp>(null);

    const [page, setPage] = useState(1);
    const [quantity, setQuantity] = useState(25);
    const [orderColumn, setOrderColumn] = useState<SeriesOrderColumn>("id");
    const [orderBy, setOrderBy] = useState<OrderBy>("asc");
    const [search, setSearch] = useState("");

    const [paginatedSeries, setPaginatedSeries] = useState<Pagination<Series> | null>(null);
    const [series, setSeries] = useState<Array<Series>>([]);

    const [deleteSeriesCardData, setDeleteSeriesCardData] = useState<Series | null>(null);
    const [showSuccessCard, setShowSuccessCard] = useState(false);

    const handlePageChange = (_event: ChangeEvent<unknown>, page: number) => {
        setPage(page);
    };

    const handleOrderColumnChange = (event: SelectChangeEvent<SeriesOrderColumn>) => {
        setOrderColumn(event.target.value as SeriesOrderColumn);
    };

    const handleOrderByChange = (event: SelectChangeEvent<OrderBy>) => {
        setOrderBy(event.target.value as OrderBy);
    };

    const handleQuantityChange = (event: SelectChangeEvent<number>) => {
        const newQuantity = Number(event.target.value);

        if (Number.isNaN(newQuantity))
            return;

        setQuantity(newQuantity);
    };

    const handleErrorClose = () => {
        setStatusCode(null);
        window.location.href = "/";
    };

    const fetchAllSeries = async () => fetch(`${API_URL}/series/all?page=${page}&quantity=${quantity}&orderColumn=${orderColumn}&orderBy=${orderBy}${search.length > 0 ? `&search=${search}` : ""}`)
        .then(handleFetchAllSeriesResponse)
        .catch(console.error)
        .finally(() => setIsRequestLoading(false));

    useEffect(
        () => {
            setIsRequestLoading(true);

            fetchAllSeries();
        },

        [
            page,
            quantity,
            orderColumn,
            orderBy,
            search
        ]
    );

    useEffect(
        () => {
            paginatedSeries
                ? setSeries(paginatedSeries.data)
                : setSeries([]);

            const isCurrentPageEmpty = paginatedSeries &&
                paginatedSeries.data.length <= 0 &&
                paginatedSeries.currentPage > 1;

            if (isCurrentPageEmpty)
                setPage(1)
        },

        [
            paginatedSeries
        ]
    );

    const handleFetchAllSeriesResponse = async (response: Response) => {
        const data = await response.json();

        if (!response.ok)
            return setStatusCode(response.status as ErrorCardStatusCodeProp);

        const builtPaginatedSeries = new PaginationBuilder<Series>(data);
        setPaginatedSeries(builtPaginatedSeries);
    };

    const handleDeleteSeriesResponse = async (response: Response) => {
        if (!response.ok)
            return setStatusCode(response.status as ErrorCardStatusCodeProp);

        setShowSuccessCard(true);
    };

    const getOpenDeleteSeriesCardHandler = (series: Series) => {
        const handleOpenDeleteSeriesCard = () => {
            setDeleteSeriesCardData(series);
        };

        return handleOpenDeleteSeriesCard;
    };

    const getDeleteSeriesHandler = (series: Series | null) => {
        const finishDeleteProcess = () => {
            setDeleteSeriesCardData(null);

            fetchAllSeries();
        }

        return () => {
            if (!series)
                return;

            setIsRequestLoading(true);

            fetch(
                `${API_URL}/series/inactivate/${series.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
                .then(handleDeleteSeriesResponse)
                .catch(console.error)
                .finally(finishDeleteProcess)
        }
    };

    const handleDeleteSeriesCardClose = () => {
        setDeleteSeriesCardData(null);
    };

    const handleSearchChange = (newSearch: string) => {
        setSearch(newSearch);
    };

    const noContentWarning = <Typography variant="body1">Não há séries cadastradas.</Typography>

    return (
        <>
            <Box sx={{ position: "relative" }}>
                <PaginatedContent<SeriesOrderColumn>
                    contentTitle="Gerenciar séries"
                    hidePaginationContent={series.length <= 0}
                    isRequestLoading={isRequestLoading}
                    currentQuantity={series.length}
                    totalQuantity={paginatedSeries?.totalQuantity || 0}
                    noContent={noContentWarning}

                    newSearch={search}
                    handleSearchChange={handleSearchChange}

                    quantityPerPage={quantity}
                    handleQuantityPerPageChange={handleQuantityChange}

                    page={page}
                    handlePageChange={handlePageChange}
                    lastPage={paginatedSeries?.lastPage || 1}

                    orderBy={orderBy}
                    handleOrderByChange={handleOrderByChange}

                    orderColumns={[
                        ["id", "ID"],
                        ["mainName", "Nome"],
                        ["updatedAt", "Recentemente atualizado"]
                    ]}
                    handleOrderColumnChange={handleOrderColumnChange}
                    currentOrderColumn={orderColumn}
                >
                    <AdminPanelSeriesTable
                        data={series}
                        getDeleteHandler={getOpenDeleteSeriesCardHandler}
                    />
                </PaginatedContent>

                <AdminPanelAddContentFAB href="/admin/series/0" />

                <AdminPanelDeleteSeriesCard
                    series={deleteSeriesCardData}
                    isOpen={!!deleteSeriesCardData}
                    handleClose={handleDeleteSeriesCardClose}
                    handleDelete={getDeleteSeriesHandler(deleteSeriesCardData)}
                />

                <ErrorCard
                    isOpen={!!statusCode}
                    statusCode={statusCode}
                    handleClose={handleErrorClose}
                    reasons={"Um erro inesperado ocorreu. Por favor, tente novamente mais tarde."}
                />

                <SuccessCard
                    message="Série deletada com sucesso!"
                    isOpen={showSuccessCard}
                    handleClose={() => setShowSuccessCard(false)}
                />
            </Box>
        </>
    );
}