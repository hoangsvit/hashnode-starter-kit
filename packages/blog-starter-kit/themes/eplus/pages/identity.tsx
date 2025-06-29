import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import request from 'graphql-request';
import { Container } from '../components/container';
import { Layout } from '../components/layout';
import HnButton from '../components/hn-button';
import { AppProvider } from '../components/contexts/appContext';
import {
	PublicationFragment,
	PublicationByHostDocument,
	PublicationByHostQuery,
	PublicationByHostQueryVariables,
} from '../generated/graphql';
import { resizeImage } from '@starter-kit/utils/image';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

interface IdentityPageProps {
	publication: PublicationFragment;
}

export default function IdentityPage({ publication }: Readonly<IdentityPageProps>) {
	const router = useRouter();
	const [isProcessing, setIsProcessing] = useState(false);
	const [identityStatus, setIdentityStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [userInfo, setUserInfo] = useState<any>(null);
	const { guid, next } = router.query;

	const handleIdentityVerification = useCallback(async (identityGuid: string) => {
		setIsProcessing(true);
		setIdentityStatus('idle');
		setErrorMessage('');

		try {
			const apiUrl = `/api/identity?guid=${encodeURIComponent(identityGuid)}`;
			console.log('🔗 Calling API:', apiUrl);

			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Quan trọng để nhận cookies
			});

			console.log('📊 Response status:', response.status);
			console.log('📋 Response headers:', response.headers);

			if (response.ok) {
				const result = await response.json();
				console.log('✅ Success response:', result);

				// Lưu thông tin user
				setUserInfo(result.user);

				// Cookies sẽ được set tự động từ response headers
				setIdentityStatus('success');

				// Điều hướng sau 5 giây để user có thể xem thông tin
				setTimeout(() => {
					const redirectUrl = (next as string) || '/';
					router.push(redirectUrl);
				}, 5000);
			} else {
				console.error('❌ API Error - Status:', response.status);
				const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
				console.error('❌ Error data:', errorData);
				setIdentityStatus('error');
				setErrorMessage(errorData.message ?? `API Error: ${response.status} ${response.statusText}`);
			}
		} catch (error: unknown) {
			console.error('💥 Network/Fetch error:', error);
			setIdentityStatus('error');
			setErrorMessage('Có lỗi xảy ra trong quá trình xác thực danh tính');
		} finally {
			setIsProcessing(false);
		}
	}, [next, router]);

	useEffect(() => {
		if (guid && typeof guid === 'string') {
			handleIdentityVerification(guid);
		}
	}, [guid, handleIdentityVerification]);

	const handleRetry = () => {
		if (guid && typeof guid === 'string') {
			handleIdentityVerification(guid);
		}
	};

	return (
		<AppProvider publication={publication}>
			<Layout>
				<Container className="px-4 py-8">
					<div className="max-w-md mx-auto">
						<div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
							<div className="text-center">
								{/* Logo */}
								<div className="mb-6">
									{publication.preferences.logo ? (
										<Image
											src={resizeImage(publication.preferences.logo, { w: 80, h: 80 })}
											alt={publication.title}
											width={80}
											height={80}
											className="mx-auto rounded-full"
										/>
									) : (
										<div className="w-20 h-20 mx-auto bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
											<span className="text-2xl font-bold text-neutral-600 dark:text-neutral-300">
												{publication.title.charAt(0)}
											</span>
										</div>
									)}
								</div>

							{/* Tiêu đề */}
							<h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
								Xác thực danh tính
							</h1>

							{/* Trạng thái xác thực */}
							{!guid && (
								<div className="mb-6">
									<div className="text-red-600 dark:text-red-400 mb-4">
										⚠️ Không tìm thấy GUID xác thực danh tính
									</div>
									<p className="text-neutral-600 dark:text-neutral-400 text-sm">
										Vui lòng kiểm tra lại link xác thực danh tính từ email.
									</p>
								</div>
							)}

							{guid && isProcessing && (
								<div className="mb-6">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
									<p className="text-neutral-600 dark:text-neutral-400">
										Đang xác thực danh tính...
									</p>
								</div>
							)}

							{identityStatus === 'success' && (
								<div className="mb-6">
									<div className="text-green-600 text-4xl mb-4">✅</div>
									<h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">
										Xác thực danh tính thành công!
									</h2>

									{/* Hiển thị thông tin user */}
									{userInfo && (
										<div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 mb-4 text-left">
											<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
												Thông tin tài khoản
											</h3>

											<div className="space-y-3">
												{/* Avatar và tên */}
												<div className="flex items-center space-x-3 mb-4">
													{userInfo.profilePicture ? (
														<Image
															src={userInfo.profilePicture}
															alt={userInfo.name}
															width={50}
															height={50}
															className="rounded-full"
														/>
													) : (
														<div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
															<span className="text-lg font-bold text-neutral-600 dark:text-neutral-300">
																{userInfo.name?.charAt(0) || userInfo.username?.charAt(0) || '?'}
															</span>
														</div>
													)}
													<div>
														<div className="font-semibold text-neutral-900 dark:text-neutral-100">
															{userInfo.name}
														</div>
														{userInfo.username && (
															<div className="text-sm text-neutral-600 dark:text-neutral-400">
																@{userInfo.username}
															</div>
														)}
													</div>
												</div>

												{/* Email */}
												<div className="flex justify-between">
													<span className="text-neutral-600 dark:text-neutral-400">Email:</span>
													<span className="text-neutral-900 dark:text-neutral-100 font-medium">
														{userInfo.email}
													</span>
												</div>

												{/* Role */}
												<div className="flex justify-between">
													<span className="text-neutral-600 dark:text-neutral-400">Vai trò:</span>
													<span className="text-neutral-900 dark:text-neutral-100 font-medium">
														{userInfo.role === 'verified_user' ? 'Người dùng đã xác thực' : userInfo.role}
													</span>
												</div>

												{/* Verification status */}
												<div className="flex justify-between">
													<span className="text-neutral-600 dark:text-neutral-400">Trạng thái:</span>
													<span className={`font-medium ${userInfo.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
														{userInfo.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
													</span>
												</div>

												{/* Bio */}
												{userInfo.bio && (
													<div>
														<span className="text-neutral-600 dark:text-neutral-400">Giới thiệu:</span>
														<p className="text-neutral-900 dark:text-neutral-100 mt-1">
															{userInfo.bio}
														</p>
													</div>
												)}

												{/* Tagline */}
												{userInfo.tagline && (
													<div>
														<span className="text-neutral-600 dark:text-neutral-400">Khẩu hiệu:</span>
														<p className="text-neutral-900 dark:text-neutral-100 mt-1">
															{userInfo.tagline}
														</p>
													</div>
												)}

												{/* Location */}
												{userInfo.location && (
													<div className="flex justify-between">
														<span className="text-neutral-600 dark:text-neutral-400">Vị trí:</span>
														<span className="text-neutral-900 dark:text-neutral-100 font-medium">
															{userInfo.location}
														</span>
													</div>
												)}

												{/* Followers/Following */}
												{(userInfo.followersCount !== undefined || userInfo.followingsCount !== undefined) && (
													<div className="flex justify-between">
														<span className="text-neutral-600 dark:text-neutral-400">Mạng xã hội:</span>
														<div className="text-neutral-900 dark:text-neutral-100 font-medium">
															{userInfo.followersCount !== undefined && (
																<span className="mr-4">
																	{userInfo.followersCount} người theo dõi
																</span>
															)}
															{userInfo.followingsCount !== undefined && (
																<span>
																	{userInfo.followingsCount} đang theo dõi
																</span>
															)}
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									<p className="text-neutral-600 dark:text-neutral-400 text-sm">
										Bạn sẽ được chuyển hướng trong 5 giây...
									</p>
								</div>
							)}

							{identityStatus === 'error' && (
								<div className="mb-6">
									<div className="text-red-600 text-4xl mb-4">❌</div>
									<h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
										Xác thực danh tính thất bại
									</h2>
									<p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
										{errorMessage}
									</p>
									<HnButton
										onClick={handleRetry}
										disabled={isProcessing}
										className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
									>
										Thử lại
									</HnButton>
								</div>
							)}

							{/* Link về trang chủ */}
							<div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
								<HnButton
									onClick={() => router.push('/')}
									variant="transparent"
									className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
								>
									← Về trang chủ
								</HnButton>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</Layout>
	</AppProvider>
);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { guid } = context.query;

	// Nếu không có guid, vẫn render page để hiển thị thông báo lỗi
	if (!guid) {
		console.warn('Identity page accessed without guid');
	}

	try {
		const data = await request<PublicationByHostQuery, PublicationByHostQueryVariables>(
			GQL_ENDPOINT,
			PublicationByHostDocument,
			{
				host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
			},
		);

		const publication = data.publication;
		if (!publication) {
			return {
				notFound: true,
			};
		}

		return {
			props: {
				publication,
			},
		};
	} catch (error) {
		console.error('Error fetching publication:', error);
		return {
			notFound: true,
		};
	}
};
